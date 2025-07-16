import { Button } from '../../ui/button';
import { useRouter } from 'next/navigation';
export function Hero() {
  const router = useRouter();
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-[#000d39] mb-6">
            Connect. Serve. Grow.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
            Utservio is a simple and powerful platform that connects service
            providers and customers — directly, transparently, and instantly.
            Whether you're offering a service or searching for one, Utservio helps
            you do it faster and better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-[#000d39] hover:bg-[#000d39]/90 text-white px-8 py-6 text-lg"
              onClick={() => router.push('login')}
            >
              Join as Provider
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#000d39] text-[#000d39] hover:bg-[#000d39] hover:text-white px-8 py-6 text-lg bg-transparent"
              onClick={() => {
                router.push('explore');
              }}
            >
              Explore Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
