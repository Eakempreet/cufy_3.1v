'use client'

import { motion } from 'framer-motion'
import { Percent, ShoppingBag, Coffee, Book, Music, Utensils, Car, Smartphone, Tag, Star } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const discountCategories = [
  { name: 'All Offers', count: 8, active: true, icon: Tag },
  { name: 'Food & Dining', count: 3, active: false, icon: Utensils },
  { name: 'Education', count: 2, active: false, icon: Book },
  { name: 'Entertainment', count: 1, active: false, icon: Music },
  { name: 'Health', count: 1, active: false, icon: Star },
  { name: 'Other', count: 1, active: false, icon: ShoppingBag }
]

const expiredDeals = [
  {
    id: 1,
    title: 'Local Cafe Discount',
    discount: '20% OFF',
    originalPrice: '₹100',
    discountedPrice: '₹80',
    description: 'Was offering discount on coffee and snacks at campus cafe.',
    category: 'Food & Dining',
    validity: 'Expired on Aug 31, 2024',
    code: 'CAFE20',
    rating: 4.2,
    users: '150+',
    image: '☕',
    featured: true,
    expired: true
  },
  {
    id: 2,
    title: 'Stationery Shop Deal',
    discount: '15% OFF',
    originalPrice: '₹200',
    discountedPrice: '₹170',
    description: 'Was offering discount on books and stationery items.',
    category: 'Education',
    validity: 'Expired on Aug 25, 2024',
    code: 'BOOKS15',
    rating: 4.0,
    users: '80+',
    image: '📚',
    featured: true,
    expired: true
  },
  {
    id: 3,
    title: 'Local Restaurant',
    discount: '25% OFF',
    originalPrice: '₹300',
    discountedPrice: '₹225',
    description: 'Was offering discount on meals at nearby restaurant.',
    category: 'Food & Dining',
    validity: 'Expired on Aug 20, 2024',
    code: 'FOOD25',
    rating: 4.5,
    users: '200+',
    image: '🍕',
    featured: true,
    expired: true
  }
]

const allExpiredDeals = [
  {
    title: 'Campus Bookstore',
    discount: '10% OFF',
    price: 'On textbooks',
    category: 'Education',
    description: 'Was offering discount on course books and supplies.',
    image: '�',
    code: 'STUDENT10',
    expired: 'Aug 15, 2024'
  },
  {
    title: 'Local Pizza Place',
    discount: '15% OFF',
    price: 'On all orders',
    category: 'Food & Dining',
    description: 'Was offering discount on pizza and fast food.',
    image: '🍕',
    code: 'PIZZA15',
    expired: 'Aug 18, 2024'
  },
  {
    title: 'Nearby Gym',
    discount: '20% OFF',
    price: 'Monthly membership',
    category: 'Health',
    description: 'Was offering student discount on gym membership.',
    image: '💪',
    code: 'GYM20',
    expired: 'Aug 22, 2024'
  },
  {
    title: 'Coffee Shop Chain',
    discount: '10% OFF',
    price: 'All beverages',
    category: 'Food & Dining',
    description: 'Was offering discount on coffee and beverages.',
    image: '☕',
    code: 'COFFEE10',
    expired: 'Aug 25, 2024'
  },
  {
    title: 'Local Cinema',
    discount: '25% OFF',
    price: 'Movie tickets',
    category: 'Entertainment',
    description: 'Was offering student discount on movie tickets.',
    image: '🎬',
    code: 'MOVIE25',
    expired: 'Aug 28, 2024'
  }
]

export default function StudentDiscounts() {
  const [selectedCategory, setSelectedCategory] = useState('All Offers')

  const filteredDeals = selectedCategory === 'All Offers' 
    ? allExpiredDeals 
    : allExpiredDeals.filter(deal => deal.category === selectedCategory)

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
              <Percent className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Student <span className="bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text">Discounts</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Exclusive discounts and offers for Cufy users! Save money on everything from food delivery 
              to entertainment, shopping, and educational tools.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Savings Stats */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '₹5,000+', label: 'Total Savings', icon: Percent },
              { number: '8+', label: 'Local Partners', icon: Tag },
              { number: '400+', label: 'Students Saved', icon: Star },
              { number: '18%', label: 'Average Discount', icon: ShoppingBag }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Recently Expired <span className="bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text">Deals</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              These amazing offers have recently expired. Stay tuned for new deals coming soon!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {expiredDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6 relative overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                {/* Expired Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    EXPIRED
                  </div>
                </div>

                {/* Deal Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{deal.image}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{deal.title}</h3>
                    <div className="text-sm text-green-400">{deal.category}</div>
                  </div>
                </div>

                {/* Discount Badge */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text mb-2">
                    {deal.discount}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-white/60 line-through">{deal.originalPrice}</span>
                    <span className="text-2xl font-bold text-white">{deal.discountedPrice}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/80 text-sm mb-4 text-center">
                  {deal.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{deal.rating}</span>
                  </div>
                  <div className="text-white/60">{deal.users} users</div>
                </div>

                {/* Validity and Code */}
                <div className="bg-white/10 rounded-lg p-3 mb-4 text-center">
                  <div className="text-xs text-white/60 mb-1">Promo Code</div>
                  <div className="font-mono font-bold text-green-400">{deal.code}</div>
                </div>

                {/* Action Button */}
                <button disabled className="w-full bg-gray-600 text-gray-300 py-3 rounded-xl font-semibold cursor-not-allowed">
                  Deal Expired
                </button>

                <div className="text-center text-xs text-red-400 mt-2">
                  {deal.validity}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {discountCategories.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <category.icon className="h-4 w-4" />
                {category.name} ({category.count})
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* All Deals Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Past <span className="bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text">Offers</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Browse through our previously available discounts. New deals will be coming soon!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-2xl">{deal.image}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{deal.title}</h3>
                    <div className="text-sm text-blue-400">{deal.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{deal.discount}</div>
                    <div className="text-sm text-white/80">{deal.price}</div>
                  </div>
                </div>

                <p className="text-white/70 text-sm mb-4">
                  {deal.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="bg-white/10 px-3 py-1 rounded-lg">
                    <div className="text-xs text-white/60">Code</div>
                    <div className="font-mono text-sm text-red-400">{deal.code}</div>
                  </div>
                  <button disabled className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed">
                    Expired
                  </button>
                </div>

                <div className="text-center text-xs text-red-400 mt-2">
                  Expired: {deal.expired}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How to <span className="bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text">Claim Discounts</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Browse Deals',
                description: 'Explore our curated list of student discounts from top brands.',
                icon: '🔍'
              },
              {
                step: 2,
                title: 'Verify Student Status',
                description: 'Confirm your college enrollment through your Cufy profile.',
                icon: '✅'
              },
              {
                step: 3,
                title: 'Claim & Save',
                description: 'Use the promo codes or follow the redemption instructions.',
                icon: '💰'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-white/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
          >
            <Tag className="h-16 w-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Never Miss a <span className="bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text">Deal</span>!
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Subscribe to get notified about new discounts, exclusive offers, and limited-time deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-green-400"
              />
              <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-white/50 text-sm mt-4">
              Join 15,000+ students already saving money with Cufy deals!
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
