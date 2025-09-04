'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight, Heart, BookOpen, Coffee, Users } from 'lucide-react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const blogPosts = [
  {
    id: 1,
    title: 'The Ultimate Guide to College Dating in 2024',
    excerpt: 'Navigate the modern college dating scene with confidence. Learn about digital dating etiquette, campus romance, and building meaningful connections.',
    author: 'Cufy Team',
    date: 'November 15, 2024',
    readTime: '8 min read',
    category: 'Dating Tips',
    image: '/api/placeholder/400/200',
    tags: ['Dating', 'College Life', 'Relationships']
  },
  {
    id: 2,
    title: 'Study Partners vs. Life Partners: Finding Balance',
    excerpt: 'Discover how to maintain academic excellence while exploring romantic relationships. Tips for studying together and supporting each other&apos;s goals.',
    author: 'Dr. Priya Sharma',
    date: 'November 10, 2024',
    readTime: '6 min read',
    category: 'Relationships',
    image: '/api/placeholder/400/200',
    tags: ['Study Tips', 'Balance', 'Academic Success']
  },
  {
    id: 3,
    title: 'Campus Safety: A Guide for College Daters',
    excerpt: 'Essential safety tips for meeting new people on campus. From first dates to building trust - stay safe while finding love.',
    author: 'Safety Team',
    date: 'November 5, 2024',
    readTime: '5 min read',
    category: 'Safety',
    image: '/api/placeholder/400/200',
    tags: ['Safety', 'Campus Life', 'First Dates']
  },
  {
    id: 4,
    title: 'Long-Distance College Relationships: Making it Work',
    excerpt: 'Practical advice for maintaining relationships across different colleges and cities. Communication, trust, and planning for the future.',
    author: 'Relationship Expert',
    date: 'October 28, 2024',
    readTime: '10 min read',
    category: 'Relationships',
    image: '/api/placeholder/400/200',
    tags: ['Long Distance', 'Communication', 'College']
  },
  {
    id: 5,
    title: 'Breaking the Ice: Conversation Starters That Work',
    excerpt: 'Move beyond "Hey" and "How are you?" with conversation starters that lead to meaningful connections and engaging discussions.',
    author: 'Communication Coach',
    date: 'October 20, 2024',
    readTime: '4 min read',
    category: 'Dating Tips',
    image: '/api/placeholder/400/200',
    tags: ['Communication', 'First Impressions', 'Dating']
  },
  {
    id: 6,
    title: 'Mental Health and Relationships in College',
    excerpt: 'Understanding the connection between mental wellness and healthy relationships. Supporting your partner and yourself through college stress.',
    author: 'Mental Health Team',
    date: 'October 15, 2024',
    readTime: '12 min read',
    category: 'Wellness',
    image: '/api/placeholder/400/200',
    tags: ['Mental Health', 'Support', 'College Stress']
  }
]

const categories = [
  { name: 'All Posts', count: 25, active: true },
  { name: 'Dating Tips', count: 8, active: false },
  { name: 'Relationships', count: 6, active: false },
  { name: 'Safety', count: 4, active: false },
  { name: 'College Life', count: 7, active: false }
]

const featuredPost = {
  title: 'The Science Behind Successful College Relationships',
  excerpt: 'Recent research reveals what makes college relationships last. From shared goals to communication patterns, discover the key factors that lead to lasting love.',
  author: 'Research Team',
  date: 'November 20, 2024',
  readTime: '15 min read',
  image: '/api/placeholder/600/300'
}

export default function Blog() {
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
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Cufy <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">Blog</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Insights, tips, and stories about college relationships, dating, and building meaningful connections. 
              Your guide to navigating love and life on campus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                <Heart className="h-20 w-20 text-white/50" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-purple-400 font-semibold mb-2">FEATURED POST</div>
                <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                <p className="text-white/70 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-white/60 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 w-fit">
                  Read Article
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  category.active
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

      {/* Blog Posts Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-white/50 group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category */}
                  <div className="text-sm text-purple-400 font-semibold mb-2">{post.category}</div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors duration-300">
                    {post.title}
                  </h3>
                  
                  {/* Excerpt */}
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-white/60 mb-4">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  
                  {/* Read More */}
                  <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                    Read More
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Coffee className="h-16 w-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stay Updated with <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">Cufy Insights</span>
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Get the latest relationship tips, college dating advice, and success stories 
              delivered straight to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
              />
              <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-white/50 text-sm mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
