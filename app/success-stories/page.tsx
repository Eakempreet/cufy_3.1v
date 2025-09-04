'use client'

import { motion } from 'framer-motion'
import { Heart, Star, MapPin, Calendar, Users, Quote, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const successStories = [
  {
    id: 1,
    names: 'Arjun & Priya',
    college: 'IIT Delhi',
    story: 'We matched during our final year and discovered we had the same favorite library spot. Three years later, we&apos;re planning our wedding!',
    relationship: 'Married',
    duration: '3 years',
    image: '/api/placeholder/300/300',
    tags: ['Study Partners', 'Long-term'],
    testimonial: 'Cufy helped us find not just love, but a life partner who truly understands the engineering mindset.'
  },
  {
    id: 2,
    names: 'Rohan & Sneha',
    college: 'Delhi University',
    story: 'Started as study partners for our economics exam, ended up being partners for life. Cufy made it so easy to connect!',
    relationship: 'Engaged',
    duration: '2 years',
    image: '/api/placeholder/300/300',
    tags: ['Study Partners', 'Campus Love'],
    testimonial: 'The best decision we made was joining Cufy. It&apos;s where our beautiful journey began.'
  },
  {
    id: 3,
    names: 'Vikram & Ananya',
    college: 'Mumbai University',
    story: 'Both of us were shy and found it hard to meet people. Cufy&apos;s matching algorithm brought us together perfectly!',
    relationship: 'Dating',
    duration: '1.5 years',
    image: '/api/placeholder/300/300',
    tags: ['Introvert Friendly', 'Perfect Match'],
    testimonial: 'Cufy understood what we were looking for better than we did ourselves.'
  },
  {
    id: 4,
    names: 'Aaditya & Kavya',
    college: 'Bangalore University',
    story: 'We were from different departments but shared the same passion for music. Our first date was at a college concert!',
    relationship: 'Dating',
    duration: '8 months',
    image: '/api/placeholder/300/300',
    tags: ['Music Lovers', 'Cross Department'],
    testimonial: 'Finding someone who shares your passion is magical. Cufy made it happen for us.'
  },
  {
    id: 5,
    names: 'Rahul & Meera',
    college: 'Pune University',
    story: 'Long-distance seemed impossible until we found each other on Cufy. Now we&apos;re planning to study abroad together!',
    relationship: 'Dating',
    duration: '1 year',
    image: '/api/placeholder/300/300',
    tags: ['Long Distance', 'Future Plans'],
    testimonial: 'Cufy proved that true connections transcend distance and time.'
  },
  {
    id: 6,
    names: 'Karthik & Divya',
    college: 'Chennai University',
    story: 'We were both focused on our studies and weren&apos;t looking for love, but Cufy had other plans. Best surprise ever!',
    relationship: 'Dating',
    duration: '6 months',
    image: '/api/placeholder/300/300',
    tags: ['Unexpected Love', 'Academic Focus'],
    testimonial: 'Sometimes the best things happen when you least expect them. Thank you, Cufy!'
  }
]

const stats = [
  { number: '2,500+', label: 'Success Stories', icon: Heart },
  { number: '850+', label: 'Campus Couples', icon: Users },
  { number: '95%', label: 'Satisfaction Rate', icon: Star },
  { number: '120+', label: 'Colleges Represented', icon: MapPin }
]

export default function SuccessStories() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <Heart className="h-10 w-10 text-white fill-current" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Real <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Love Stories</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Discover how thousands of college students have found meaningful relationships, 
              study partners, and life-long connections through Cufy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
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
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Campus Love Stories</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              From study partners to soulmates, here are some of our favorite success stories 
              from college students across India.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-square bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center">
                  <Heart className="h-20 w-20 text-white/50" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Names & College */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">{story.names}</h3>
                    <div className="flex items-center text-white/60 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {story.college}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-full text-xs text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Story */}
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    {story.story}
                  </p>

                  {/* Testimonial */}
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <Quote className="h-4 w-4 text-pink-400 mb-2" />
                    <p className="text-white/80 text-sm italic">
                      {story.testimonial}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex justify-between items-center text-xs text-white/60">
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1 text-pink-400" />
                      {story.relationship}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {story.duration}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
              What Our <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Community Says</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Cufy is not just a dating app, it&apos;s a community where genuine connections are made. I found my best friend and study partner here!",
                author: "Sarah, DU",
                rating: 5
              },
              {
                text: "The safety features and college verification gave me confidence to be myself. Met amazing people who truly understand student life.",
                author: "Amit, IIT Bombay", 
                rating: 5
              },
              {
                text: "From awkward first messages to deep conversations about life goals - Cufy helped me find someone who truly gets me.",
                author: "Pooja, JNU",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 mb-4 italic">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="text-white/60 text-sm">
                  - {testimonial.author}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
          >
            <Sparkles className="h-16 w-16 text-pink-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Write Your <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Success Story</span>?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of college students who have found love, friendship, 
              and meaningful connections on Cufy.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-pink-500/25 flex items-center gap-2 mx-auto"
            >
              <Heart className="h-5 w-5" />
              Start Your Journey
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
