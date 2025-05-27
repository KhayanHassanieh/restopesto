'use client';
import Navbar from '../components/Navbar';
import { FiArrowRight, FiCheck, FiMessageSquare, FiClock, FiTrendingUp, FiSmartphone, FiAward, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-16 overflow-hidden">
        {/* 🌈 Hero Section with Animated Gradient */}
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A4E7A]/10 via-[#E85C4A]/10 to-[#F9F5F0] transform scale-125 rotate-6"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-6 max-w-6xl mx-auto"
          >
            <div className="inline-block px-4 py-2 mb-6 bg-[#E85C4A]/10 rounded-full text-[#E85C4A] font-medium">
              Revolutionizing Restaurant Tech
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2A4E7A] mb-6 leading-tight">
              <span className="block">Fine Dining</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E85C4A] to-[#D4A76A]">Reimagined</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#555] max-w-3xl mx-auto mb-10">
              The most elegant WhatsApp ordering system for premium restaurants. 
              Combine Michelin-star service with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#contact"
                className="bg-gradient-to-r from-[#E85C4A] to-[#D54C3A] text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                Request Demo <FiArrowRight />
              </motion.a>
              <a 
                href="#features"
                className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-[#2A4E7A] text-[#2A4E7A] hover:bg-[#2A4E7A]/5 transition-all"
              >
                Explore Features
              </a>
            </div>
          </motion.div>
          
          {/* Floating Mockups */}
          <div className="absolute bottom-20 left-1/4 w-32 h-56 bg-white rounded-xl shadow-2xl transform rotate-6 hidden lg:block"></div>
          <div className="absolute bottom-32 right-1/4 w-32 h-56 bg-white rounded-xl shadow-2xl transform -rotate-3 hidden lg:block"></div>
        </section>

        {/* ✨ Premium Features */}
        <section id="features" className="py-28 px-6 bg-[#F9F5F0]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-[#2A4E7A] mb-4">The RestoPesto Difference</h2>
              <p className="text-xl text-[#555] max-w-2xl mx-auto">
                Why luxury restaurants choose our platform for their digital transformation
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-[#E5DED5]"
                >
                  <div className="text-4xl text-[#E85C4A] mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold text-[#2A4E7A] mb-3">{feature.title}</h3>
                  <p className="text-[#555]">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🍱 Menu Showcase */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-4xl font-bold text-[#2A4E7A] mb-6">Exquisite Digital Menus</h2>
                <p className="text-xl text-[#555] mb-8">
                  We transform your culinary offerings into stunning digital experiences that match your restaurant's ambiance.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <FiCheck className="text-2xl text-[#E85C4A] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">High-Resolution Photography</h4>
                      <p className="text-[#666]">Showcase dishes with professional food styling</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <FiCheck className="text-2xl text-[#E85C4A] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">Seasonal Menu Animations</h4>
                      <p className="text-[#666]">Elegant transitions between courses</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <FiCheck className="text-2xl text-[#E85C4A] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">Sommelier Pairing Suggestions</h4>
                      <p className="text-[#666]">Integrated wine recommendations</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="bg-[#F9F5F0] rounded-3xl p-2 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="h-8 bg-[#2A4E7A]/10 border-b flex items-center px-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#E85C4A]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#E85C4A]/50"></div>
                        <div className="w-3 h-3 rounded-full bg-[#E85C4A]/20"></div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl">Today's Specials</h3>
                        <div className="text-sm text-[#E85C4A]">Seasonal Menu</div>
                      </div>
                      <div className="space-y-6">
                        {menuItems.map((item, index) => (
                          <div key={index} className="border-b border-[#F5F5F5] pb-4">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{item.name}</h4>
                              <span className="font-semibold">{item.price}</span>
                            </div>
                            <p className="text-sm text-[#666] mt-1">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 📈 Stats Section */}
        <section className="py-20 bg-gradient-to-r from-[#2A4E7A] to-[#3A6EA5] text-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="p-8">
                  <div className="text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-xl">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ✉️ Contact Section */}
        <section id="contact" className="py-28 px-6 bg-[#F9F5F0]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2A4E7A] mb-4">Ready to Elevate Your Service?</h2>
              <p className="text-xl text-[#555]">
                Schedule a consultation with our hospitality technology specialists
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-10 bg-[#2A4E7A] text-white">
                  <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm text-[#A8C686] mb-1">Email</div>
                      <div>contact@restopesto.com</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#A8C686] mb-1">Phone</div>
                      <div>+1 (555) 123-4567</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#A8C686] mb-1">Office Hours</div>
                      <div>Mon-Fri: 9AM - 6PM</div>
                    </div>
                  </div>
                </div>
                <div className="p-10">
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#555] mb-1">Your Name</label>
                      <input type="text" className="w-full px-4 py-3 rounded-lg border border-[#D5CEC5] focus:ring-2 focus:ring-[#E85C4A]/50 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#555] mb-1">Restaurant Name</label>
                      <input type="text" className="w-full px-4 py-3 rounded-lg border border-[#D5CEC5] focus:ring-2 focus:ring-[#E85C4A]/50 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#555] mb-1">Email Address</label>
                      <input type="email" className="w-full px-4 py-3 rounded-lg border border-[#D5CEC5] focus:ring-2 focus:ring-[#E85C4A]/50 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#555] mb-1">Message</label>
                      <textarea rows="4" className="w-full px-4 py-3 rounded-lg border border-[#D5CEC5] focus:ring-2 focus:ring-[#E85C4A]/50 focus:border-transparent"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-[#E85C4A] to-[#D54C3A] text-white px-6 py-4 rounded-lg font-semibold shadow hover:shadow-md transition">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const features = [
  {
    icon: <FiMessageSquare />,
    title: "WhatsApp Luxury Experience",
    description: "Customers order through WhatsApp with premium interface matching your brand"
  },
  {
    icon: <FiClock />,
    title: "Real-Time Kitchen Sync",
    description: "Instant updates to kitchen displays with order details and special requests"
  },
  {
    icon: <FiTrendingUp />,
    title: "Reservation Insights",
    description: "Predictive analytics for staffing and inventory based on booking trends"
  },
  {
    icon: <FiSmartphone />,
    title: "Digital Wine Cellar",
    description: "Interactive wine list with sommelier notes and pairing recommendations"
  },
  {
    icon: <FiAward />,
    title: "Michelin-Star Templates",
    description: "Award-winning menu designs used by top restaurants worldwide"
  },
  {
    icon: <FiUsers />,
    title: "VIP Guest Profiles",
    description: "Remember preferences for returning guests (allergies, favorite tables)"
  }
];

const menuItems = [
  {
    name: "Truffle Risotto",
    price: "$38",
    description: "Arborio rice, white truffle, parmesan foam"
  },
  {
    name: "Wagyu Beef Carpaccio",
    price: "$42",
    description: "A5 Miyazaki beef, wild arugula, truffle oil"
  },
  {
    name: "Scallop Ceviche",
    price: "$34",
    description: "Dayboat scallops, yuzu, avocado mousse"
  }
];

const stats = [
  {
    value: "3x",
    label: "Higher average order value"
  },
  {
    value: "45%",
    label: "Reduced ordering errors"
  },
  {
    value: "92%",
    label: "Guest satisfaction rate"
  }
];