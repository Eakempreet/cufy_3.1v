'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Clock, Star, Heart, Music, Coffee, BookOpen, Camera } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const pastEvents = [
  {
    id: 1,
    title: 'Campus Coffee Meetup',
    date: '2024-08-15',
    time: '4:00 PM - 6:00 PM',
    location: 'College Canteen',
    college: 'Local College',
    attendees: 25,
    maxAttendees: 30,
    category: 'Social',
    description: 'Simple coffee meetup where students got to know each other.',
    highlights: ['Free Coffee', 'Casual Chat'],
    price: 'Free',
    image: '☕',
    status: 'completed',
    rating: 4.5,
    feedback: 'Nice and simple meetup!'
  },
  {
    id: 2,
    title: 'Study Group',
    date: '2024-08-10',
    time: '2:00 PM - 4:00 PM',
    location: 'Library Hall',
    college: 'Local College',
    attendees: 15,
    maxAttendees: 20,
    category: 'Academic',
    description: 'Students formed study groups for upcoming exams.',
    highlights: ['Group Study', 'Notes Sharing'],
    price: 'Free',
    image: '📚',
    status: 'completed',
    rating: 4.2,
    feedback: 'Helpful for exam prep.'
  },
  {
    id: 3,
    title: 'Movie Night',
    date: '2024-08-20',
    time: '7:00 PM - 10:00 PM',
    location: 'College Auditorium',
    college: 'Local College',
    attendees: 40,
    maxAttendees: 50,
    category: 'Entertainment',
    description: 'Watched a movie together in the college auditorium.',
    highlights: ['Free Movie', 'Popcorn'],
    price: '₹50',
    image: '🎬',
    status: 'completed',
    rating: 4.7,
    feedback: 'Fun movie night with friends!'
  }
]

const eventCategories = [
  { name: 'All Events', count: 8, active: true, color: 'blue' },
  { name: 'Social', count: 3, active: false, color: 'pink' },
  { name: 'Academic', count: 2, active: false, color: 'green' },
  { name: 'Entertainment', count: 2, active: false, color: 'purple' },
  { name: 'Other', count: 1, active: false, color: 'orange' }
]

export default function CampusEvents() {
  const [selectedCategory, setSelectedCategory] = useState('All Events')

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Campus <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">Events</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Connect with fellow students through exciting events, meetups, and activities. 
              From study groups to social mixers, find your tribe and make lasting memories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Event Stats */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '15+', label: 'Events Hosted', icon: Calendar },
              { number: '300+', label: 'Attendees', icon: Users },
              { number: '4.5/5', label: 'Average Rating', icon: Star },
              { number: '5+', label: 'Colleges Involved', icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {eventCategories.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category.name} ({category.count})
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Events */}
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
              Recent <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">Events</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Check out these past events and see what amazing experiences you missed!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                {/* Event Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{event.image}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            event.category === 'Social' ? 'bg-pink-500/20 text-pink-300' :
                            event.category === 'Academic' ? 'bg-green-500/20 text-green-300' :
                            event.category === 'Creative' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {event.category}
                          </span>
                          <span>{event.college}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300`}>
                      Completed
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Users className="h-4 w-4" />
                      {event.attendees} attended
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.highlights.map((highlight, hIndex) => (
                      <span
                        key={hIndex}
                        className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="text-xl font-bold text-yellow-400">{event.rating}</span>
                    </div>
                    <div className="text-sm text-white/70 italic">
                      &quot;{event.feedback}&quot;
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Host an Event CTA */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
          >
            <Music className="h-16 w-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Want to Host an <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">Event</span>?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Have a great idea for a campus event? Partner with us to bring your vision to life 
              and connect with students across your college!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-purple-500/25 flex items-center gap-2 justify-center"
              >
                <Calendar className="h-5 w-5" />
                Propose Event
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 justify-center transition-all duration-300"
              >
                <BookOpen className="h-5 w-5" />
                Event Guidelines
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
