'use client'

import { motion } from 'framer-motion'
import { Heart, Instagram, Linkedin, Twitter, MessageSquare, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const socialLinks = [
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://www.instagram.com/cufy_official/',
    username: '@cufy_official',
    color: 'from-pink-500 to-purple-600',
    hoverColor: 'hover:text-pink-400'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://www.linkedin.com/in/cufy',
    username: 'cufy',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:text-blue-400'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://x.com/Cufy_Official',
    username: '@Cufy_Official',
    color: 'from-blue-400 to-blue-500',
    hoverColor: 'hover:text-blue-300'
  },
  {
    name: 'Quora',
    icon: MessageSquare,
    url: 'https://www.quora.com/profile/Cufy-4',
    username: 'Cufy',
    color: 'from-red-500 to-red-600',
    hoverColor: 'hover:text-red-400'
  },
  {
    name: 'Reddit',
    icon: ExternalLink,
    url: 'https://www.reddit.com/user/Cufy_Offical/',
    username: 'u/Cufy_Official',
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'hover:text-orange-400'
  }
]

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { name: 'How it Works', href: '/how-it-works' },
      { name: 'Safety', href: '/safety' },
      { name: 'Success Stories', href: '/success-stories' },
      { name: 'Blog', href: '/blog' }
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '/help-center' },
      { name: 'Contact Us', href: '/contact-us' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-of-service' }
    ]
  },
  {
    title: 'Community',
    links: [
      { name: 'College Partners', href: '/college-partners' },
      { name: 'Campus Events', href: '/campus-events' },
      { name: 'Student Discounts', href: '/student-discounts' },
      { name: 'Referral Program', href: '/referral-program' }
    ]
  }
]

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="relative border-t border-white/10 backdrop-blur-md bg-black/20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10"></div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600">
                  <Heart className="h-8 w-8 text-white fill-current" />
                </div>
                <span className="text-2xl font-bold font-poppins text-white">
                  Cufy
                </span>
              </div>
              
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                The premier college dating platform connecting students across India. 
                Find your perfect study partner, best friend, or soulmate.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-lg font-bold text-gradient">1.6K+</div>
                  <div className="text-xs text-white/60">Students</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-lg font-bold text-gradient">32+</div>
                  <div className="text-xs text-white/60">Colleges</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold text-lg mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8 mb-8"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Follow Our Journey
            </h3>
            <p className="text-white/60 text-sm">
              Stay updated with the latest features, success stories, and college events
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.1 
                }}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`
                  flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl 
                  bg-white/5 border border-white/10 
                  hover:border-white/20 transition-all duration-300
                  hover:bg-white/10
                `}>
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${social.color}`}>
                    <social.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium text-xs sm:text-sm">
                      {social.name}
                    </div>
                    <div className="text-white/60 text-xs hidden sm:block">
                      {social.username}
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-white/40 text-sm">
                © 2024 Cufy. All rights reserved.
              </p>
              <p className="text-white/30 text-xs mt-1">
                Matches are meant to meet. ✨
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-6 text-white/40 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Verified Profiles</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>College Focused</span>
              </div>
            </div>

            {/* Made with Love */}
            <div className="flex items-center space-x-2 text-white/40 text-sm">
              <span>Made with</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="h-4 w-4 text-pink-400 fill-current" />
              </motion.div>
              <span>for students</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}