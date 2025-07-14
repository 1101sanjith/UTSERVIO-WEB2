'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../app/lib/supabaseClient';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Card from './card';
import GridIcon from '../gridicon';
import MainServiceButton from './ServiceButtons/MainServiceButton';
import AdditionalServiceButton from './ServiceButtons/AdditionalServiceButton';
import ServicePopup from '../../forms/servicepopup';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'add' | 'main' | 'additional' | 'all'>(
    'add',
  );
  const [isLiking, setIsLiking] = useState(false);

  const router = useRouter();

  const fetchUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      console.error('Error fetching user:', error);
      return null;
    }
    return user;
  };

  const fetchLikesAndUpdateServices = async () => {
    try {
      const user = await fetchUser();
      if (!user) return;

      // Fetch all services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id); // Filter to show only user's services

      if (servicesError) throw servicesError;

      // Fetch all likes grouped by service_id
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('service_id, count')
        .select('service_id') // We only need service_id for counting
        .then((res) => {
          if (res.error) throw res.error;

          // Count likes per service manually
          const counts: Record<number, number> = {};
          res.data?.forEach((like) => {
            counts[like.service_id] = (counts[like.service_id] || 0) + 1;
          });

          return {
            data: counts,
            error: null,
          };
        });

      if (likesError) throw likesError;

      // Check which services the current user has liked
      const { data: userLikes, error: userLikesError } = await supabase
        .from('likes')
        .select('service_id')
        .eq('user_id', user.id);

      if (userLikesError) throw userLikesError;

      // Enrich services with like counts and user's like status
      const enrichedServices = servicesData.map((service) => {
        const likeCount = likesData ? likesData[service.id] || 0 : 0;
        const likedByUser =
          userLikes?.some((like) => like.service_id === service.id) || false;

        return {
          ...service,
          likes: likeCount,
          likedByUser,
        };
      });

      setServices(enrichedServices);
    } catch (err) {
      console.error('Error fetching services with likes:', err);
    }
  };

  const fetchData = async () => {
    try {
      const user = await fetchUser();
      if (!user) return;

      const [profileRes, notifRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('notifications')
          .select('*')
          .eq('provider_id', user.id)
          .eq('read', false),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (notifRes.error) throw notifRes.error;

      setProfile(profileRes.data);
      setNotificationCount(notifRes.data?.length || 0);

      await fetchLikesAndUpdateServices();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const likesSubscription = supabase
      .channel('likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
        },
        () => fetchLikesAndUpdateServices(),
      )
      .subscribe();

    const serviceUpdateSubscription = supabase
      .channel('services_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'services',
        },
        (payload) => {
          setServices((prev) =>
            prev.map((s) =>
              s.id === payload.new.id ? { ...s, ...payload.new } : s,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesSubscription);
      supabase.removeChannel(serviceUpdateSubscription);
    };
  }, []);

  const handleLikeService = async (serviceId: number) => {
    setIsLiking(true);
    try {
      const user = await fetchUser();
      if (!user) return alert('Proszę się zalogować.');

      // Check for existing like with error handling
      const { data: existingLike, error: existingError } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('service_id', serviceId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingLike) {
        // Unlike if already liked
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
        if (deleteError) throw deleteError;
      } else {
        // Like if not already liked
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            service_id: serviceId,
          })
          .select(); // Add this to get better error reporting

        if (insertError) {
          // Handle specific duplicate key error
          if (insertError.code === '23505') {
            // Like already exists, just refresh the data
            await fetchLikesAndUpdateServices();
            return;
          }
          throw insertError;
        }
      }

      // Update UI
      await fetchLikesAndUpdateServices();
    } catch (error) {
      console.error('Błąd podczas obsługi polubienia:', error);
      alert('Błąd aktualizacji polubienia. Proszę spróbować ponownie.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSaveService = async (serviceData: any) => {
    await fetchLikesAndUpdateServices(); // Ensure data is fresh
    setShowServicePopup(false);
    setSelectedService(null);
  };

  const handleEditService = (id: number) => {
    const service = services.find((s) => s.id === id);
    if (service) {
      setSelectedService(service);
      setShowServicePopup(true);
    }
  };

  const handleBuyService = async (service: any) => {
    if (!(window as any).Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    const user = await fetchUser();
    if (!user) return alert('Please log in.');

    const res = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: service.cost,
        currency: 'INR',
        receipt: `order_rcptid_${service.id}`,
      }),
    });

    const order = await res.json();
    if (!order.id) return alert('Razorpay order creation failed.');

    const rzp = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: service.service_name,
      description: service.description,
      image: service.image_url || '/images/placeholder.svg',
      order_id: order.id,
      handler: async function (response: any) {
        const { error } = await supabase.from('orders').insert({
          service_id: service.id,
          buyer_id: user.id,
          provider_id: service.provider_id,
          amount: Number(service.cost),
          currency: 'INR',
          razorpay_payment_id: response.razorpay_payment_id,
          status: 'paid',
        });
        if (error) alert('Order save failed: ' + error.message);
        else alert('Payment successful!');
      },
      theme: { color: '#6366f1' },
    });

    rzp.open();
  };

  const mainServices = services.filter((s) => s.service_type === 'main');
  const additionalServices = services.filter(
    (s) => s.service_type === 'additional',
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out ${
          isSidebarOpen
            ? 'translate-x-0'
            : 'md:-translate-x-64 -translate-x-[-100%] invisible pointer-events-none'
        }`}
      >
        <Sidebar
          onClose={() => setIsSidebarOpen(false)}
          onLogout={onLogout}
          onServiceClick={(type) => {
            setView('add');
            setShowServicePopup(true);
            setSelectedService({ service_type: type });
          }}
          onNav={setView}
        />
      </div>

      <div
        className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNotificationClick={() => {}}
          notificationCount={notificationCount}
          profile={profile}
          handleLogout={onLogout}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 overflow-auto">
          {view === 'add' && (
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-16">
              <MainServiceButton
                onClick={() => {
                  setShowServicePopup(true);
                  setSelectedService({ service_type: 'main' });
                }}
              />
              <AdditionalServiceButton
                onClick={() => {
                  setShowServicePopup(true);
                  setSelectedService({ service_type: 'additional' });
                }}
              />
            </div>
          )}

          {['main', 'additional', 'all'].includes(view) && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(view === 'main'
                ? mainServices
                : view === 'additional'
                  ? additionalServices
                  : services
              ).map((service) => (
                <Card
                  key={service.id}
                  id={service.id}
                  serviceName={service.service_name}
                  serviceCost={service.cost}
                  serviceDescription={service.description}
                  image={service.image_url || '/images/placeholder.svg'}
                  likes={service.likes || 0}
                  likedByUser={service.likedByUser || false}
                  onEdit={handleEditService}
                  onLike={handleLikeService}
                  onBuy={() => handleBuyService(service)}
                />
              ))}
            </div>
          )}
        </main>

        <GridIcon onClick={() => setView(view === 'all' ? 'add' : 'all')} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {showServicePopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <ServicePopup
            onSave={handleSaveService}
            onClose={() => {
              setShowServicePopup(false);
              setSelectedService(null);
            }}
            initialData={selectedService}
          />
        </div>
      )}
    </div>
  );
}
