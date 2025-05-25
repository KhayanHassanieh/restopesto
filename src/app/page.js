'use client';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="bg-[#FDF8F0] text-[#4A4A4A] pt-20 scroll-smooth">

        {/* Hero Section */}
        <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3A6EA5] mb-4">
            Welcome to RestoPesto
          </h1>
          <p className="text-lg max-w-2xl mb-6">
            Empowering restaurants to elevate their online ordering experience with style, speed, and simplicity.
          </p>
          <a href="#services" className="bg-[#F76C5E] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow hover:bg-[#e75c50] transition">
            Get Started
          </a>
        </section>

        {/* About Us */}
        <section id="about" className="py-24 px-6 bg-[#A8C686]/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-[#3A6EA5] mb-4">About Us</h2>
            <p className="text-lg leading-relaxed">
              At RestoPesto, we build smart digital menus for restaurants of all sizes. Our goal is to modernize the customer experience through mobile-first technology, real-time updates, and clean user interfaces.
            </p>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold text-[#3A6EA5] text-center mb-10">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border border-[#eaeaea]">
                <h3 className="text-xl font-semibold mb-2 text-[#3A6EA5]">Dynamic Menus</h3>
                <p>Real-time menu updates to keep your offerings fresh and relevant.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border border-[#eaeaea]">
                <h3 className="text-xl font-semibold mb-2 text-[#3A6EA5]">Mobile Ordering</h3>
                <p>Customers can browse, order, and pay — all from their phones.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border border-[#eaeaea]">
                <h3 className="text-xl font-semibold mb-2 text-[#3A6EA5]">Analytics Dashboard</h3>
                <p>Track order trends, peak hours, and customer preferences.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border border-[#eaeaea]">
                <h3 className="text-xl font-semibold mb-2 text-[#3A6EA5]">Custom Branding</h3>
                <p>Menus styled to match your restaurant’s aesthetic, colors, and vibe.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-24 px-6 bg-[#8E735B]/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-[#3A6EA5] mb-4">Contact Us</h2>
            <p className="text-lg mb-6">
              Ready to modernize your restaurant’s ordering? Let’s talk!
            </p>
            <a href="mailto:contact@restopesto.com" className="text-[#F76C5E] font-semibold underline hover:text-[#e75c50]">
              contact@restopesto.com
            </a>
          </div>
        </section>

      </main>
    </>
  );
}
