import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/">
          <img
            src="/images/logo-mobile.png"    // ← your file here
            alt="Logo"
            className="h-10 w-auto"  // tweak height as needed
          />
        </Link>
        <nav className="hidden md:flex space-x-6 text-gray-600 hover:text-[#000d39]">
          <Link href="#providers">For Providers</Link>
          <Link href="#seekers">For Seekers</Link>
          <Link href="#about">About</Link>
          <Link href="#contact">Contact</Link>
        </nav>
      </div>
    </header>
);
}
