import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Phone, Users, Zap, Search, CheckCircle, Shield } from 'lucide-react';

export function Services() {
  return (
    <>
      {/* For Service Providers */}
      <section id="providers" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#f0ad1c] text-[#000d39] mb-4">
                For Service Providers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#000d39] mb-6">
                Start Earning by Offering Your Services
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Servyo is built for providers who want to grow. Sign up using
                your phone number or Google account, add your services in just a
                few steps, and start receiving direct customer calls. Manage
                service requests effortlessly through your personal dashboard.
              </p>
            </div>
            <Card className="border-2 border-gray-100">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#f0ad1c] p-2 rounded-lg">
                    <Phone className="h-6 w-6 text-[#000d39]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#000d39] mb-2">
                      Direct Customer Calls
                    </h3>
                    <p className="text-gray-600">
                      Receive calls directly from customers without any middlemen
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-[#f0ad1c] p-2 rounded-lg">
                    <Zap className="h-6 w-6 text-[#000d39]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#000d39] mb-2">
                      Quick Setup
                    </h3>
                    <p className="text-gray-600">
                      Add your services in just a few simple steps
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-[#f0ad1c] p-2 rounded-lg">
                    <Users className="h-6 w-6 text-[#000d39]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#000d39] mb-2">
                      Personal Dashboard
                    </h3>
                    <p className="text-gray-600">
                      Manage all your service requests in one place
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Service Seekers */}
      <section id="seekers" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Card className="border-2 border-gray-100 lg:order-1">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#f0ad1c] p-2 rounded-lg">
                    <Search className="h-6 w-6 text-[#000d39]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#000d39] mb-2">
                      Easy Discovery
                    </h3>
                    <p className="text-gray-600">
                      Find trusted professionals in your area quickly
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-[#f0ad1c] p-2 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-[#000d39]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#000d39] mb-2">
                      Transparent Pricing
                    </h3>
                    <p className="text-gray-600">
                      Clear service details and upfront pricing
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-[#f0ad1c] p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-[#000d39]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#000d39] mb-2">
                      Direct Connection
                    </h3>
                    <p className="text-gray-600">
                      No middlemen, no commissions, just real services
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="lg:order-2">
              <Badge className="bg-[#f0ad1c] text-[#000d39] mb-4">
                For Service Seekers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#000d39] mb-6">
                Find Reliable Services in Just a Few Taps
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Discover trusted professionals in your area with clear service
                details, upfront pricing, and profile transparency. Like, share,
                or connect directly — no middlemen, no commissions, just real
                services.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
