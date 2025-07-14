import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-2xl font-bold text-[#000d39]">Servyo</div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="#providers"
            className="text-gray-600 hover:text-[#000d39] transition-colors"
          >
            For Providers
          </Link>
          <Link
            href="#seekers"
            className="text-gray-600 hover:text-[#000d39] transition-colors"
          >
            For Seekers
          </Link>
          <Link
            href="#about"
            className="text-gray-600 hover:text-[#000d39] transition-colors"
          >
            About
          </Link>
          <Link
            href="#contact"
            className="text-gray-600 hover:text-[#000d39] transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
