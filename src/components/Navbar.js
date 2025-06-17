'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-black">
                <span className="text-[#ffd200]">Krave</span> Menus
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-[#ffd200] font-medium transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-[#ffd200] font-medium transition">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-[#ffd200] font-medium transition">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-gray-700 hover:text-[#ffd200] font-medium transition">
              Testimonials
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-[#ffd200] font-medium transition">
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link 
              href="#pricing" 
              className="bg-[#ffd200] hover:bg-[#e6bd00] text-black font-bold py-2 px-6 rounded-lg transition shadow hover:shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#ffd200] focus:outline-none"
            >
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white pb-4`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="#features" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#ffd200] hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>
          <Link 
            href="#how-it-works" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#ffd200] hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            How It Works
          </Link>
          <Link 
            href="#pricing" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#ffd200] hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </Link>
          <Link 
            href="#testimonials" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#ffd200] hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Testimonials
          </Link>
          <Link 
            href="#contact" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#ffd200] hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          <div className="px-3 pt-2">
            <Link 
              href="#pricing" 
              className="block w-full bg-[#ffd200] hover:bg-[#e6bd00] text-black font-bold py-2 px-4 rounded-lg text-center transition"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}