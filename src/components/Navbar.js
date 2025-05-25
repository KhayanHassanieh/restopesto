'use client';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-[#3A6EA5]">RestoPesto</div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
          <a href="#about" className="px-3 py-2 rounded-lg hover:bg-[#3A6EA5]/10 hover:text-[#3A6EA5] transition">About Us</a>
          <a href="#services" className="px-3 py-2 rounded-lg hover:bg-[#3A6EA5]/10 hover:text-[#3A6EA5] transition">Services</a>
          <a href="#contact" className="px-3 py-2 rounded-lg hover:bg-[#3A6EA5]/10 hover:text-[#3A6EA5] transition">Contact</a>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#3A6EA5] text-2xl"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-2 text-sm font-medium text-gray-800">
          <a href="#about" onClick={() => setMenuOpen(false)} className="block hover:text-[#3A6EA5]">About Us</a>
          <a href="#services" onClick={() => setMenuOpen(false)} className="block hover:text-[#3A6EA5]">Services</a>
          <a href="#contact" onClick={() => setMenuOpen(false)} className="block hover:text-[#3A6EA5]">Contact</a>
        </div>
      )}
    </header>
  );
}
