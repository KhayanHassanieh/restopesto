'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaQrcode, FaChartLine, FaMobileAlt, FaPalette, FaCrown, FaCheck } from 'react-icons/fa';
import { IoRestaurant } from 'react-icons/io5';
import { MdSupportAgent } from 'react-icons/md';
import PhoneMockupSlider from '@/components/PhoneMockupSlider';
import AnimatedContent from '@/components/AnimatedContent'
import ContactForm from '@/components/ContactForm';
import { useState } from 'react';
export default function Home() {
  const [isYearly, setIsYearly] = useState(true);
  return (
    <>
      <Navbar />

      <main className="bg-[#f3f3f3] text-[#333] scroll-smooth">

    <section
  id="home"
  className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
>
  {/* Replace the current background tint with glass effect */}
  <div className="absolute inset-0 z-1 backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg" />

  {/* Phone mockup scroll as background */}
  <div className="absolute inset-0 z-0 pointer-events-none flex items-center">
    <div className="w-full overflow-hidden">
      <PhoneMockupSlider />
    </div>
  </div>

  {/* Main Hero Content */}
  <div className="max-w-4xl mx-auto relative z-10">
    <img
      src='/logo/Krave Logo.png'
      alt="Krave Menus Logo"
      className="mx-auto mb-6 w-full max-w-[650px]"
    />
    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
      Smart QR menus with real-time analytics and seamless customer experience
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="#pricing"
        className="bg-[#ffd200] hover:bg-[#e6bd00] text-[#333333] px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Get Started Today
      </a>
      <a
        href="#features"
        className="bg-[#f3f3f3] border-2 border-[#333333] hover:bg-gray-100 text-[#333333] px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Explore Features
      </a>
    </div>
  </div>
</section>


        {/* Logo Cloud */}
        {/* <section className="py-12 bg-[#f3f3f3]">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-gray-500 mb-8">Trusted by restaurants nationwide</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-center">
                  <IoRestaurant className="text-gray-400 text-4xl" />
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Features */}
    <section id="features" className="relative py-20 px-6 overflow-visible">
  {/* Background food image that will be half inside/half outside glass */}
  <div className="absolute inset-0 flex items-center justify-end z-0 ">
    <img 
      src="/UI/salmon-potato-salad.png" // Replace with your food image path   
      alt="Delicious food"
      className=" h-[50%] object-contain overflow-visible"
      style={{
        position: 'absolute',
        left: '3%', // Adjust this to control how much of the plate shows
        top: '30%',
        transform: 'translateY(-60%)'
        
      }}
    />

     <img 
      src="/UI/pizza.png" // Replace with your food image path   
      alt="Delicious food"
      className=" h-[50%] object-contain overflow-visible"
      style={{
        position: 'absolute',
        right: '2%', // Adjust this to control how much of the plate shows
       
        transform: 'translateY(50%)'
      }}
    />
  </div>

  {/* Glass container with padding */}
  <div className="max-w-6xl mx-auto relative">
    <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-[15px] border border-white/30 shadow-xl">
      <div className="text-center mb-16 pt-8">
        <h2 className="text-4xl font-bold mb-4">Smart Ordering Solutions</h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Everything you need to modernize your restaurant&apos;s ordering experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px] p-[15px]">
        {/* Feature 1 */}
        <AnimatedContent
          distance={50}
          direction="vertical"
          reverse={false}
          duration={0.5}
          ease="power3.out"
          initialOpacity={0.0}
          animateOpacity
          scale={1.05}
          threshold={0.2}
          delay={0.2}
        >
          <div className="bg-white/90 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <FaQrcode className="text-[#ffd200] text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-3">QR Code Menus</h3>
            <p className="text-gray-700">
              Beautiful, customizable digital menus accessible via QR code - no app downloads required.
            </p>
          </div>
        </AnimatedContent>

        {/* Feature 2 */}
        <AnimatedContent
          distance={50}
          direction="vertical"
          reverse={false}
          duration={0.5}
          ease="power3.out"
          initialOpacity={0.0}
          animateOpacity
          scale={1.05}
          threshold={0.2}
          delay={0.4}
        >
          <div className="bg-white/90 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <FaChartLine className="text-[#ffd200] text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Real-time Analytics</h3>
            <p className="text-gray-700">
              Track orders, popular items, peak times, and customer behavior.
            </p>
          </div>
        </AnimatedContent>

        {/* Feature 3 */}
        <AnimatedContent
          distance={50}
          direction="vertical"
          reverse={false}
          duration={0.5}
          ease="power3.out"
          initialOpacity={0.0}
          animateOpacity
          scale={1.05}
          threshold={0.2}
          delay={0.5}
        >
          <div className="bg-white/90 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <FaMobileAlt className="text-[#ffd200] text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Mobile-First Design</h3>
            <p className="text-gray-700">
              Perfectly optimized menus that look great on any device.
            </p>
          </div>
        </AnimatedContent>

        {/* Feature 4 */}
        <AnimatedContent
          distance={50}
          direction="vertical"
          reverse={false}
          duration={0.5}
          ease="power3.out"
          initialOpacity={0.0}
          animateOpacity
          scale={1.05}
          threshold={0.1}
          delay={0.55}
        >
          <div className="bg-white/90 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <FaPalette className="text-[#ffd200] text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Custom Branding</h3>
            <p className="text-gray-700">
              Match your restaurant's aesthetic with custom styling options.
            </p>
          </div>
        </AnimatedContent>

        {/* Feature 5 */}
        <AnimatedContent
          distance={50}
          direction="vertical"
          reverse={false}
          duration={0.5}
          ease="power3.out"
          initialOpacity={0.0}
          animateOpacity
          scale={1.05}
          threshold={0.1}
          delay={0.6}
        >
          <div className="bg-white/90 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <IoRestaurant className="text-[#ffd200] text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Instant Updates</h3>
            <p className="text-gray-700">
              Change menu items in seconds - updates appear immediately.
            </p>
          </div>
        </AnimatedContent>

        {/* Feature 6 */}
        <AnimatedContent
          distance={50}
          direction="vertical"
          reverse={false}
          duration={0.5}
          ease="power3.out"
          initialOpacity={0.0}
          animateOpacity
          scale={1.05}
          threshold={0.1}
          delay={0.62}
        >
          <div className="bg-white/90 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <MdSupportAgent className="text-[#ffd200] text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Dedicated Support</h3>
            <p className="text-gray-700">
              Our team helps you optimize your digital menu experience.
            </p>
          </div>
        </AnimatedContent>
      </div>
    </div>
  </div>
</section>

      {/* How It Works (glass) */}
<section id="how-it-works" className="relative py-24 px-6 overflow-visible">
  {/* soft radial background */}


  {/* floating plates like the reference */}
  <img
    src="/UI/salad.png"
    alt=""
    className="absolute left-10 top-0 h-[60%] object-contain drop-shadow-xl pointer-events-none"
  />
  <img
    src="/UI/juice.png"
    alt=""
    className=" absolute right-10 bottom-[-60px] h-[60%] object-contain drop-shadow-xl pointer-events-none "
  />

  <div className="max-w-6xl mx-auto relative">
    <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6 md:p-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">How Krave Menus Works</h2>
        <p className="text-xl text-gray-700">Simple setup, powerful results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* step 1 */}
        <div className="relative bg-white/60 backdrop-blur-md border border-white/60 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
          <span className="absolute -top-3 -left-3 bg-[#ffd200] text-[#333] font-bold rounded-lg px-3 py-1">1</span>
          <img src="/UI/1st_number_image.png" className="w-24 mx-auto mb-4" alt="" />
          <h3 className="text-xl font-bold mb-2 text-center">Customer Selects Items</h3>
          <p className="text-gray-700 text-center">A seamless, mobile-friendly menu for easy item selection.</p>
        </div>

        {/* step 2 */}
        <div className="relative bg-white/60 backdrop-blur-md border border-white/60 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
          <span className="absolute -top-3 -left-3 bg-[#ffd200] text-[#333] font-bold rounded-lg px-3 py-1">2</span>
          <img src="/UI/2nd_number_image.png" className="w-24 mx-auto mb-4" alt="" />
          <h3 className="text-xl font-bold mb-2 text-center">Shareable Cart with Friends</h3>
          <p className="text-gray-700 text-center">Group ordering made easy — more items, more value.</p>
        </div>

        {/* step 3 */}
        <div className="relative bg-white/60 backdrop-blur-md border border-white/60 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
          <span className="absolute -top-3 -left-3 bg-[#ffd200] text-[#333] font-bold rounded-lg px-3 py-1">3</span>
          <img src="/UI/3rd_number_image.png" className="w-24 mx-auto mb-4" alt="" />
          <h3 className="text-xl font-bold mb-2 text-center">Ordering via WhatsApp</h3>
          <p className="text-gray-700 text-center">No apps, no delays — orders sent instantly to your team.</p>
        </div>
      </div>
    </div>
  </div>
</section>


       {/* Pricing (glass) */}
<section id="pricing" className="relative py-24 px-6 overflow-visible">
  {/* background glow + floating plate */}
  <div className="absolute inset-0 -z-10">
    <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-red-300/20 blur-3xl" />
    <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#ffd200]/25 blur-3xl" />
  </div>
  <img
    src="/UI/meat.png"
    alt=""
    className=" absolute left-[130px] top-[170px] h-[35%] drop-shadow-xl pointer-events-none"
  />
<img
    src="/UI/sushi.png"
    alt=""
    className=" absolute right-[60px] top-[600px] h-[35%] drop-shadow-xl pointer-events-none "
  />
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-10">
      <h2 className="text-4xl font-bold mb-4">Flexible Plans</h2>
      <p className="text-xl text-gray-700">Choose monthly or yearly billing</p>
    </div>

    {/* glass toggle */}
    <div className="flex justify-center mb-10">
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl p-1 shadow-lg">
        <button
          onClick={() => setIsYearly(false)}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            !isYearly ? 'bg-[#ffd200] text-[#333]' : 'text-[#333]'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setIsYearly(true)}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            isYearly ? 'bg-[#ffd200] text-[#333]' : 'text-[#333]'
          }`}
        >
          Yearly
        </button>
      </div>
    </div>

    {/* cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-8 shadow-xl flex flex-col">
        <h3 className="text-2xl font-bold mb-1">Core</h3>
        <p className="text-gray-700 mb-5">Everything to get started</p>
        <div className="mb-6">
          <span className="text-4xl font-bold">${isYearly ? '250' : '25'}</span>
          <span className="text-gray-600">/{isYearly ? 'year' : 'month'}</span>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />Menu management</li>
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />Theming</li>
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />WhatsApp API</li>
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />Basic analytics</li>
        </ul>
        <a href="#contact" className="block w-full bg-[#ffd200] hover:bg-[#e6bd00] text-[#333] text-center font-bold py-3 px-4 rounded-lg transition">Get Started</a>
      </div>

      <div className="relative bg-white/70 backdrop-blur-md border-2 border-[#ffd200] rounded-2xl p-8 shadow-2xl flex flex-col">
        <div className="absolute top-0 right-0 bg-[#ffd200] text-[#333] text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
        <h3 className="text-2xl font-bold mb-1">Plus</h3>
        <p className="text-gray-700 mb-5">For growing restaurants</p>
        <div className="mb-6">
          <span className="text-4xl font-bold">${isYearly ? '300' : '30'}</span>
          <span className="text-gray-600">/{isYearly ? 'year' : 'month'}</span>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />All Core features</li>
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />Sharable cart</li>
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />Multi-branch support</li>
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />Image-based combos</li>
          <li className="flex items-center"><FaCheck className="text-[#ffd200] mr-2" />Priority onboarding</li>
        </ul>
        <a href="#contact" className="block w-full bg-[#ffd200] hover:bg-[#e6bd00] text-[#333] text-center font-bold py-3 px-4 rounded-lg transition">Get Started</a>
      </div>
    </div>

    {/* comparison (glass table) */}
    <div className="overflow-x-auto mt-16">
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-4">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">Feature</th>
              <th className="py-2 px-4 text-center">Core</th>
              <th className="py-2 px-4 text-center">Plus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40">
            <tr>
              <td className="py-2 px-4">Menu management</td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
            </tr>
            <tr>
              <td className="py-2 px-4">Theming</td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
            </tr>
            <tr>
              <td className="py-2 px-4">WhatsApp API</td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
            </tr>
            <tr>
              <td className="py-2 px-4">Basic analytics</td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
            </tr>
            <tr>
              <td className="py-2 px-4">Sharable cart</td>
              <td className="py-2 px-4 text-center"></td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
            </tr>
            <tr>
              <td className="py-2 px-4">Multi-branch support</td>
              <td className="py-2 px-4 text-center"></td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
            </tr>
            <tr>
              <td className="py-2 px-4">Image-based combos</td>
              <td className="py-2 px-4 text-center"></td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
            </tr>
            <tr>
              <td className="py-2 px-4">Priority onboarding</td>
              <td className="py-2 px-4 text-center"></td>
              <td className="py-2 px-4 text-center"><FaCheck className="inline text-[#ffd200]" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>


        {/* Testimonials */}
        {/* <section id="testimonials" className="py-20 bg-[#ffd200]/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don&apos;t just take our word for it
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#ffffff] rounded-xl p-8 shadow-lg">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, star) => (
                      <svg key={star} className="w-5 h-5 text-[#ffd200]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">
                    &quot;Krave Menus transformed our restaurant&apos;s ordering process. Our customers love the convenience, and we&apos;ve seen a 30% increase in average order value since implementing their solution.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                    <div>
                      <h4 className="font-bold">Sarah Johnson</h4>
                      <p className="text-gray-500 text-sm">Owner, The Bistro Cafe</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

       {/* CTA (glass on gradient) */}
<section className="relative overflow-visible py-24">
  {/* background gradient */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fff7c2] via-white to-[#e0ffe9]" />
  {/* garnish/plates */}
  <img src="/UI/mashewe.png" alt="" className="hidden md:block absolute left-[200px] top-[-100px] h-[90%] drop-shadow-xl" />
  <img src="/UI/kebab.png" alt="" className="hidden md:block absolute right-[200px] bottom-[-100px] h-[100%] drop-shadow-xl" />

  <div className="max-w-4xl mx-auto px-6">
    <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-10 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Modernize Your Restaurant?</h2>
      <p className="text-lg md:text-xl text-gray-700 mb-8">Join thousands using Krave Menus to streamline operations.</p>
      <a
        href="#pricing"
        className="inline-flex items-center justify-center bg-[#ffd200] hover:bg-[#e6bd00] text-[#333] font-bold px-8 py-4 rounded-xl shadow-lg transition"
      >
        Get Started – Free for 14 Days
      </a>
    </div>
  </div>
</section>

       {/* Contact (glass) */}
<section id="contact" className="relative py-24 px-6">
  <div className="absolute inset-0 -z-10">
    <div className="absolute top-0 left-1/3 h-72 w-72 rounded-full bg-[#ffd200]/25 blur-3xl" />
    <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
  </div>

  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold mb-4">Have Questions?</h2>
      <p className="text-xl text-gray-700">Our team is here to help you get started</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      {/* info column */}
      <div className="md:col-span-1 space-y-4">
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-lg">
          <h4 className="font-bold mb-2">Sales & Support</h4>
          <p className="text-gray-700">We’ll help you choose the right plan and get set up quickly.</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-lg">
          <h4 className="font-bold mb-2">WhatsApp Orders Ready</h4>
          <p className="text-gray-700">Integrate in minutes and start receiving orders instantly.</p>
        </div>
      </div>

      {/* form */}
      <div className="md:col-span-2 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-8 md:p-10 shadow-2xl">
       {/* form */}
<div className="md:col-span-2 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-8 md:p-10 shadow-2xl">
  <ContactForm />
</div>
      </div>
    </div>
  </div>
</section>
 

      </main>

      <Footer />
    </>
  );
}