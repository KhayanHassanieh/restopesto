'use client';
import { FiMessageSquare, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#3A6EA5] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1 - Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FiMessageSquare className="text-2xl text-[#F76C5E]" />
              <span className="text-2xl font-bold">RestoPesto</span>
            </div>
            <p className="text-[#A8C686] mb-6">
              Elevating restaurant experiences through elegant WhatsApp-powered ordering solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-[#F76C5E] transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#F76C5E] transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#F76C5E] transition-colors">
                <FiFacebook size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-[#A8C686] hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-[#A8C686] hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-[#A8C686] hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#A8C686] hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic space-y-2">
              <p className="text-[#A8C686]">123 Gourmet Street</p>
              <p className="text-[#A8C686]">Foodie City, FC 10001</p>
              <p>
                <a href="mailto:contact@restopesto.com" className="text-[#A8C686] hover:text-white transition-colors">
                  contact@restopesto.com
                </a>
              </p>
              <p>
                <a href="tel:+15551234567" className="text-[#A8C686] hover:text-white transition-colors">
                  +1 (555) 123-4567
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#4A4A4A]/30 mt-12 pt-8 text-center text-[#A8C686] text-sm">
          <p>© {new Date().getFullYear()} RestoPesto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}