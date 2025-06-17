'use client';
import { useEffect, useRef } from 'react';

export default function PhoneMockupSlider() {
   const images = [
    '/mockups/Burger mockup.png',
    '/mockups/Burger mockup 1.png',
    '/mockups/Burger mockup 2.png',
    '/mockups/Burger mockup 3.png',
    '/mockups/Burger mockup.png',
    '/mockups/Burger mockup 1.png',
    '/mockups/Burger mockup 2.png',
    '/mockups/Burger mockup 3.png',
  ];

  // Render images twice for infinite loop effect
  const allImages = [...images, ...images , ...images];

  return (
    <div className="relative w-full overflow-hidden pb-0 pt-5 bg-[#b9141400]">
  <div className="h-[550px] overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {allImages.map((src, i) => (
          <div key={i} className="mx-1 w-[300px] h-[550px] flex-shrink-0">
            <img
  src={src}
  alt={`Mockup ${i}`}
  className="w-full h-full object-contain rounded-2xl shadow-lg"
/>

          </div>
        ))}
      </div>
    </div>
    </div>
  );
}