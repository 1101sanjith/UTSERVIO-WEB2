'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import debounce from 'lodash.debounce';

interface LocationData {
  District?: string;
  Name?: string;
  Block?: string;
  Pincode?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [about, setAbout] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [validatingLocation, setValidatingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      // Determine login method
      if (user.phone) {
        setLoginMethod('phone');
        setPhone(user.phone.replace('+91', ''));
      } else {
        setLoginMethod('email');
        setEmail(user.email || '');
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        setMessage(error.message);
      } else if (profile) {
        setFullName(profile.full_name || '');
        setEmail(profile.email || user.email || '');
        setPhone(profile.phone ? profile.phone.replace('+91', '') : '');
        setCity(profile.city || '');
        setPincode(profile.pincode || '');
        setAbout(profile.about || '');
        setCurrentImage(profile.profile_picture || null);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [router]);

  async function uploadImage(file: File, userId: string) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const fileNameParts = file.name.split('.');
    const fileExt = fileNameParts.length > 1 ? fileNameParts.pop() : 'jpg';
    const filePath = `${userId}.${fileExt}`;

    const { error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) throw error;

    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  const validateLocation = useCallback(
    debounce(async (value: string, type: 'city' | 'pincode') => {
      if (!value.trim()) return;

      setValidatingLocation(true);
      try {
        let url = '';
        if (type === 'pincode') {
          if (value.length !== 6) {
            setLocationError('Pincode must be 6 digits');
            return;
          }
          url = `https://api.postalpincode.in/pincode/${value}`;
        } else {
          if (value.length < 3) {
            setLocationError('City name must be at least 3 characters');
            return;
          }
          url = `https://api.postalpincode.in/postoffice/${value.trim()}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data[0]?.Status !== 'Success') {
          setLocationError(`Invalid ${type}`);
          return;
        }

        const postOffice = data[0]?.PostOffice?.[0] as LocationData;
        if (!postOffice) {
          setLocationError(`No data found for the provided ${type}`);
          return;
        }

        if (type === 'pincode') {
          const autoCity =
            postOffice.District || postOffice.Name || postOffice.Block;
          if (autoCity) setCity(autoCity);
        } else if (postOffice.Pincode) {
          setPincode(postOffice.Pincode);
        }

        setLocationError('');
      } catch (err) {
        console.error('Location validation error:', err);
        setLocationError(`Unable to validate ${type}`);
      } finally {
        setValidatingLocation(false);
      }
    }, 500),
    [],
  );

  useEffect(() => {
    if (city.trim().length >= 3 && pincode.length < 6) {
      validateLocation(city, 'city');
    }
  }, [city, pincode, validateLocation]);

  const validatePhone = async (value: string) => {
    if (!/^\d{10}$/.test(value)) {
      setPhoneError('Phone number must be 10 digits');
      return false;
    }

    const cleanNumber = '+91' + value;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('phone', cleanNumber);

      if (error) throw error;

      // Check if the phone number belongs to another user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (data && data.length > 0 && data[0].id !== user?.id) {
        setPhoneError('This phone number is already in use');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Phone validation error:', err);
      setPhoneError('Error validating phone number');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (!fullName.trim()) throw new Error('Full name is required');
      if (loginMethod === 'email' && !email.trim())
        throw new Error('Email is required');
      const isValid = await validatePhone(phone);
      if (!isValid)
        throw new Error('Phone number is invalid or already in use');
      if (!city.trim() || !pincode.trim())
        throw new Error('Location information is required');
      if (!about.trim()) throw new Error('About section is required');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      let imageUrl = currentImage;
      if (profilePicture) {
        try {
          imageUrl = await uploadImage(profilePicture, user.id);
        } catch (err: any) {
          throw new Error(`Profile picture upload failed: ${err.message}`);
        }
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName.trim(),
        email: email.trim() || user.email,
        phone: '+91' + phone,
        city: city.trim(),
        pincode: pincode.trim(),
        about: about.trim(),
        profile_picture: imageUrl,
      });

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentImage(reader.result as string);
      setProfilePicture(file);
    };
    reader.onerror = () => {
      setMessage('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
              <p className="text-gray-600">Update your personal information</p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.includes('error') || message.includes('failed')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required={loginMethod === 'email'}
                disabled={loginMethod === 'phone'}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(value);
                  if (value.length === 10) {
                    validatePhone(value);
                  } else {
                    setPhoneError('');
                  }
                }}
                className={`w-full px-4 py-3 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                required
                maxLength={10}
              />
              {phoneError && (
                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                City
              </label>
              <input
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setLocationError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Pincode
              </label>
              <input
                type="text"
                placeholder="Enter your pincode"
                value={pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPincode(val);
                  if (val.length === 6) {
                    validateLocation(val, 'pincode');
                  } else {
                    setLocationError('');
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                maxLength={6}
              />
              {validatingLocation && (
                <p className="text-xs text-gray-500">Validating location...</p>
              )}
              {locationError && (
                <p className="text-red-500 text-xs">{locationError}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              About You
            </label>
            <textarea
              placeholder="Tell us about yourself, your experience, and what services you offer..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              required
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              {(currentImage || profilePicture) && (
                <img
                  src={currentImage || URL.createObjectURL(profilePicture!)}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, or WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Updating profile...
              </div>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
