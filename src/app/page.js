'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaQrcode, FaChartLine, FaMobileAlt, FaPalette, FaCrown } from 'react-icons/fa';
import { IoRestaurant } from 'react-icons/io5';
import { MdSupportAgent } from 'react-icons/md';
import PhoneMockupSlider from '../components/PhoneMockupSlider';
export default function Home() {
  return (
    <>
      <Navbar />

      <main className="bg-[#f3f3f3] text-[#333] scroll-smooth">

       <section
  id="home"
  className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
>
  {/* Background color tint */}
  <div className="absolute inset-0 bg-[#ffffffc7] z-1" />

  {/* 👇 Phone mockup scroll as background */}
  <div className="absolute inset-0 z-0 pointer-events-none flex items-center">
    <div className="w-full overflow-hidden">
      <PhoneMockupSlider />
    </div>
  </div>

  {/* Main Hero Content */}
  <div className="max-w-4xl mx-auto relative z-10">
    <h1 className="text-5xl md:text-6xl font-bold mb-6">
      <span className="text-[#ffd200]">Transform</span> Your Restaurant&apos;s Ordering
    </h1>
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
        <section className="py-12 bg-[#f3f3f3]">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-gray-500 mb-8">Trusted by restaurants nationwide</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="flex items-center justify-center">
                  <IoRestaurant className="text-gray-400 text-4xl" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Smart Ordering Solutions</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to modernize your restaurant&apos;s ordering experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <FaQrcode className="text-[#ffd200] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">QR Code Menus</h3>
                <p className="text-gray-600">
                  Beautiful, customizable digital menus accessible via QR code - no app downloads required for customers.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <FaChartLine className="text-[#ffd200] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-time Analytics</h3>
                <p className="text-gray-600">
                  Track orders, popular items, peak times, and customer behavior with our comprehensive dashboard.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <FaMobileAlt className="text-[#ffd200] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Mobile-First Design</h3>
                <p className="text-gray-600">
                  Perfectly optimized menus that look great on any device, with intuitive ordering flows.
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <FaPalette className="text-[#ffd200] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Custom Branding</h3>
                <p className="text-gray-600">
                  Match your restaurant&apos;s aesthetic with custom colors, fonts, and layout options.
                </p>
              </div>
              
              {/* Feature 5 */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <IoRestaurant className="text-[#ffd200] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Instant Updates</h3>
                <p className="text-gray-600">
                  Change menu items, prices, or availability in seconds - changes appear immediately to customers.
                </p>
              </div>
              
              {/* Feature 6 */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="bg-[#ffd200]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <MdSupportAgent className="text-[#ffd200] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Dedicated Support</h3>
                <p className="text-gray-600">
                  Our team is here to help you set up and optimize your digital menu experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How Krave Menus Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simple setup, powerful results
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-[#ffd200] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
                <h3 className="text-xl font-bold mb-3">Customize Your Menu</h3>
                <p className="text-gray-600">
                  Upload your menu items, set prices, and customize the design to match your brand.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-[#ffd200] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
                <h3 className="text-xl font-bold mb-3">Generate QR Codes</h3>
                <p className="text-gray-600">
                  We create unique QR codes for your restaurant that you can print or display anywhere.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-[#ffd200] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
                <h3 className="text-xl font-bold mb-3">Start Receiving Orders</h3>
                <p className="text-gray-600">
                  Customers scan, browse, and order - you get instant notifications and detailed analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                No hidden fees. Cancel anytime.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold mb-4">Starter</h3>
                <p className="text-gray-600 mb-6">Perfect for small cafes and food trucks</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Up to 50 menu items
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Basic analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    QR code generation
                  </li>
                </ul>
                <a href="#" className="block w-full bg-gray-100 hover:bg-gray-200 text-[#333333] text-center font-bold py-3 px-4 rounded-lg transition">
                  Get Started
                </a>
              </div>
              
              {/* Popular Plan */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-2xl border-2 border-[#ffd200] relative">
                <div className="absolute top-0 right-0 bg-[#ffd200] text-[#333333] text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MOST POPULAR</div>
                <h3 className="text-2xl font-bold mb-4">Professional</h3>
                <p className="text-gray-600 mb-6">Ideal for full-service restaurants</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Unlimited menu items
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Custom domain
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Table ordering system
                  </li>
                </ul>
                <a href="#" className="block w-full bg-[#ffd200] hover:bg-[#e6bd00] text-[#333333] text-center font-bold py-3 px-4 rounded-lg transition">
                  Get Started
                </a>
              </div>
              
              {/* Enterprise Plan */}
              <div className="bg-[#ffffff] rounded-xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <p className="text-gray-600 mb-6">For restaurant groups and chains</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$199</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Multi-location management
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Custom integrations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    API access
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-[#ffd200] mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    White-label solutions
                  </li>
                </ul>
                <a href="#" className="block w-full bg-gray-100 hover:bg-gray-200 text-[#333333] text-center font-bold py-3 px-4 rounded-lg transition">
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-[#ffd200]/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don&apos;t just take our word for it
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map((i) => (
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
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#ffd200]">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold mb-6">Ready to Modernize Your Restaurant?</h2>
            <p className="text-xl mb-8">
              Join thousands of restaurants using Krave Menus to streamline operations and enhance customer experience.
            </p>
            <a 
              href="#pricing" 
              className="bg-[#333333] hover:bg-gray-800 text-[#f3f3f3] px-10 py-4 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
            >
              Get Started - It&apos;s Free for 14 Days
            </a>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Have Questions?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our team is here to help you get started
              </p>
            </div>
            
            <div className="bg-[#ffffff] rounded-xl shadow-lg p-8 md:p-12">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" id="name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#ffd200] focus:border-[#ffd200] outline-none transition" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#ffd200] focus:border-[#ffd200] outline-none transition" />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input type="text" id="subject" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#ffd200] focus:border-[#ffd200] outline-none transition" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea id="message" rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#ffd200] focus:border-[#ffd200] outline-none transition"></textarea>
                </div>
                <div>
                  <button type="submit" className="w-full bg-[#ffd200] hover:bg-[#e6bd00] text-[#333333] font-bold py-3 px-4 rounded-lg transition">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}