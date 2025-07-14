'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const services = {
  catering: Array.from({ length: 10 }, (_, i) => ({
    id: `catering-${i}`,
    title: `Traditional Feast ${i + 1}`,
    image: `/images/catering-${i + 1}.jpg`,
    description: 'Authentic Tamil Nadu cuisine for special occasions',
  })),
  decoration: Array.from({ length: 10 }, (_, i) => ({
    id: `decoration-${i}`,
    title: `Elegant Décor ${i + 1}`,
    image: `/images/decoration-${i + 1}.jpg`,
    description: 'Elegant and creative event decorations',
  })),
  photography: Array.from({ length: 10 }, (_, i) => ({
    id: `photography-${i}`,
    title: `Cinematic Moments ${i + 1}`,
    image: `/images/photography-${i + 1}.jpg`,
    description: 'Capture the best moments in high quality',
  })),
};

export default function ServiceGrid() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-blue-500 text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-white hover:text-blue-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Tamil Nadu Services
        </h1>
        {Object.entries(services).map(([cat, items]) => (
          <div key={cat} className="space-y-4">
            <h2 className="text-2xl font-semibold text-white capitalize">
              {cat}
            </h2>
            <div className="flex pb-4 gap-4 overflow-x-auto">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex-shrink-0 w-2/3 sm:w-72 h-48 relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="absolute bottom-[35%] left-4 right-4 text-lg sm:text-xl font-bold text-white z-20 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {item.title}
                  </h3>
                  <div className="absolute bottom-0 left-0 right-0 h-[35%] p-2 bg-black/80 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-center">
                    <p className="text-xs text-gray-300">{item.description}</p>
                    <div className="flex justify-end">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-xs">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Get Started Button at the bottom */}
        <div className="mt-12 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            onClick={() => router.push('login')}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </div>
  );
}
