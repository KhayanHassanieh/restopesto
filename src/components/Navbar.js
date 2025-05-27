'use client';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiMessageSquare } from 'react-icons/fi';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <FiMessageSquare className="text-2xl text-[#E85C4A]" />
          <span className="text-2xl font-bold text-[#2A4E7A]">RestoPesto</span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-[#555] hover:text-[#E85C4A] font-medium transition-colors relative group">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E85C4A] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#services" className="text-[#555] hover:text-[#E85C4A] font-medium transition-colors relative group">
            Services
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E85C4A] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#contact" className="px-5 py-2 bg-[#E85C4A] text-white rounded-lg font-medium hover:bg-[#D54C3A] transition-colors shadow hover:shadow-md">
            Contact
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#2A4E7A] text-2xl"
        >
          {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4">
          <a href="#about" onClick={() => setMenuOpen(false)} className="block py-2 text-[#555] hover:text-[#E85C4A] font-medium border-b border-[#F5F5F5]">
            About
          </a>
          <a href="#services" onClick={() => setMenuOpen(false)} className="block py-2 text-[#555] hover:text-[#E85C4A] font-medium border-b border-[#F5F5F5]">
            Services
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)} className="block py-2 text-[#555] hover:text-[#E85C4A] font-medium">
            Contact
          </a>
        </div>
      )}
    </header>
  );
}