import { Card, CardContent } from '../../ui/card';
import { Shield, CheckCircle, Zap, Users } from 'lucide-react';

export function WhyChooseUs() {
  return (
    <>
      {/* Why Choose Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#000d39] mb-6">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for Real-World Service Needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 border-gray-100 hover:border-[#fdfd00] transition-colors">
              <CardContent className="p-6">
                <div className="bg-[#fdfd00] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-[#000d39]" />
                </div>
                <h3 className="font-semibold text-[#000d39] mb-2">
                  Verified Profiles
                </h3>
                <p className="text-gray-600">
                  Phone-verified profiles reduce fake leads
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-gray-100 hover:border-[#fdfd00] transition-colors">
              <CardContent className="p-6">
                <div className="bg-[#fdfd00] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-[#000d39]" />
                </div>
                <h3 className="font-semibold text-[#000d39] mb-2">
                  Zero Commission
                </h3>
                <p className="text-gray-600">
                  No charges on connections between users
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-gray-100 hover:border-[#fdfd00] transition-colors">
              <CardContent className="p-6">
                <div className="bg-[#fdfd00] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-[#000d39]" />
                </div>
                <h3 className="font-semibold text-[#000d39] mb-2">
                  Full Transparency
                </h3>
                <p className="text-gray-600">
                  Clear pricing with no hidden fees
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-gray-100 hover:border-[#fdfd00] transition-colors">
              <CardContent className="p-6">
                <div className="bg-[#fdfd00] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#000d39]" />
                </div>
                <h3 className="font-semibold text-[#000d39] mb-2">
                  Always Here
                </h3>
                <p className="text-gray-600">
                  Support team available when you need help
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* From the Founders Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#000d39] mb-8">
              From the Founders
            </h2>
            <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
              "We created Servyo to solve a real problem — unreliable platforms,
              fake leads, and hidden cuts. This is our response: a clean, fair
              system where both providers and customers benefit. Simple, strong,
              and focused on what really matters — real work, real people."
            </blockquote>
            <p className="text-lg text-gray-600 font-medium">
              — Founders of Servyo
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
