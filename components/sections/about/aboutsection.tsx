'use client';
import { Services } from './services';
import { WhyChooseUs } from './why-choose-us';
// import { Contact } from "../components/contact"
// import { Footer } from "../components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Services />
      <WhyChooseUs />
    </div>
  );
}
