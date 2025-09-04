'use client'

import { motion } from 'framer-motion'
import { Gift, Users, Heart, Star, Share, Trophy, Coins, Copy, CheckCircle, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const referralStats = [
  { number: '₹2,50,000+', label: 'Total Rewards Earned', icon: Coins },
  { number: '15,000+', label: 'Successful Referrals', icon: Users },
  { number: '95%', label: 'Friend Satisfaction Rate', icon: Heart },
  { number: '₹500', label: 'Average Reward Per User', icon: Gift }
]

const howItWorks = [
  {
    step: 1,
    title: 'Share Your Code',
    description: 'Share your unique referral code with friends through social media, messaging, or in person.',
    icon: Share,
    color: 'from-blue-500 to-purple-600'
  },
  {
    step: 2,
    title: 'Friend Joins Cufy',
    description: 'Your friend signs up using your referral code and completes their profile verification.',
    icon: Users,
    color: 'from-purple-500 to-pink-600'
  },
  {
    step: 3,
    title: 'Both Get Rewards',
    description: 'You both receive rewards once your friend subscribes to any Cufy premium plan!',
    icon: Gift,
    color: 'from-pink-500 to-red-600'
  }
]

const rewardTiers = [
  {
    tier: 'Bronze Referrer',
    referrals: '1-4 friends',
    reward: '₹100 per referral',
    bonus: 'None',
    badge: '🥉',
    perks: ['Basic reward', 'Referral tracking']
  },
  {
    tier: 'Silver Referrer',
    referrals: '5-9 friends',
    reward: '₹150 per referral',
    bonus: '₹500 bonus',
    badge: '🥈',
    perks: ['Increased rewards', 'Priority support', 'Exclusive events']
  },
  {
    tier: 'Gold Referrer',
    referrals: '10-19 friends',
    reward: '₹200 per referral',
    bonus: '₹1,500 bonus',
    badge: '🥇',
    perks: ['Maximum rewards', 'VIP status', 'Early feature access']
  },
  {
    tier: 'Diamond Referrer',
    referrals: '20+ friends',
    reward: '₹300 per referral',
    bonus: '₹5,000 bonus',
    badge: '💎',
    perks: ['Premium rewards', 'Ambassador status', 'Monthly bonuses']
  }
]

const successStories = [
  {
    name: 'Priya S.',
    college: 'Delhi University',
    referrals: 23,
    earned: '₹6,900',
    testimonial: 'Amazing program! I\'ve earned enough to cover my entire year\'s subscription plus extra spending money.',
    avatar: '👩‍🎓'
  },
  {
    name: 'Rohit K.',
    college: 'IIT Bombay',
    referrals: 15,
    earned: '₹4,500',
    testimonial: 'Easy way to earn while helping friends find meaningful connections. Win-win for everyone!',
    avatar: '👨‍💻'
  },
  {
    name: 'Sneha M.',
    college: 'Mumbai University',
    referrals: 31,
    earned: '₹9,300',
    testimonial: 'Best referral program I\'ve seen. The rewards are genuine and the process is super smooth.',
    avatar: '👩‍🏫'
  }
]

export default function ReferralProgram() {
  const [referralCode] = useState('CUFY-LOVE-2024')
  const [copied, setCopied] = useState(false)

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
              <Gift className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Referral <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Program</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Share the love and earn rewards! Invite your friends to join Cufy and get rewarded 
              for every successful referral. The more friends you bring, the more you earn!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {referralStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Referral Code */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Your Referral <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Code</span>
            </h2>
            <p className="text-white/70 mb-8">
              Share this code with your friends to start earning rewards!
            </p>
            
            {/* Referral Code Box */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-xl p-6 mb-8">
              <div className="text-sm text-white/60 mb-2">Your Referral Code</div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-3xl font-mono font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
                  {referralCode}
                </div>
                <button
                  onClick={copyReferralCode}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300">
                <Share className="h-4 w-4" />
                Share on Facebook
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300">
                <MessageSquare className="h-4 w-4" />
                Share on WhatsApp
              </button>
              <button className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300">
                <Share className="h-4 w-4" />
                Share on Twitter
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
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
              How It <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Works</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Earning rewards is simple! Follow these three easy steps to start making money with referrals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-white/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reward Tiers */}
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
              Reward <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Tiers</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              The more friends you refer, the higher your rewards! Unlock exclusive benefits as you climb the tiers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewardTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white/5 backdrop-blur-xl border rounded-xl p-6 text-center ${
                  index === 2 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10'
                } hover:bg-white/10 transition-all duration-300`}
              >
                {index === 2 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      POPULAR
                    </div>
                  </div>
                )}

                <div className="text-4xl mb-4">{tier.badge}</div>
                <h3 className="text-xl font-bold mb-2">{tier.tier}</h3>
                <div className="text-sm text-white/60 mb-4">{tier.referrals}</div>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
                    {tier.reward}
                  </div>
                  {tier.bonus !== 'None' && (
                    <div className="text-sm text-green-400 font-semibold">
                      + {tier.bonus}
                    </div>
                  )}
                </div>

                <ul className="space-y-2 text-sm text-white/80">
                  {tier.perks.map((perk, perkIndex) => (
                    <li key={perkIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
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
              Success <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Stories</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Real students sharing their experiences with our referral program.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl">{story.avatar}</div>
                  <div>
                    <div className="font-bold">{story.name}</div>
                    <div className="text-sm text-white/60">{story.college}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xl font-bold text-pink-400">{story.referrals}</div>
                    <div className="text-xs text-white/60">Referrals</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xl font-bold text-green-400">{story.earned}</div>
                    <div className="text-xs text-white/60">Earned</div>
                  </div>
                </div>

                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-white/80 text-sm italic">
                  &quot;{story.testimonial}&quot;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Frequently Asked <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'How do I get my referral rewards?',
                answer: 'Rewards are automatically credited to your Cufy wallet within 24 hours of your friend subscribing to a premium plan. You can withdraw them or use them for your own subscription.'
              },
              {
                question: 'Is there a limit to how many friends I can refer?',
                answer: 'No! There\'s no limit to referrals. The more friends you refer, the more you earn and the higher your tier level becomes.'
              },
              {
                question: 'What if my friend doesn\'t subscribe immediately?',
                answer: 'No worries! The referral remains valid for 30 days. As long as they subscribe within this period using your code, you\'ll both get the rewards.'
              },
              {
                question: 'Can I refer someone who already has a Cufy account?',
                answer: 'Referrals only work for new users who haven\'t created a Cufy account before. Existing users cannot use referral codes.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h3 className="font-bold text-white mb-3">{faq.question}</h3>
                <p className="text-white/70">{faq.answer}</p>
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
            <Trophy className="h-16 w-16 text-pink-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Start <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Earning</span> Today!
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Share Cufy with your friends and start earning rewards immediately. 
              The more you share, the more you earn!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-pink-500/25 flex items-center gap-2 mx-auto"
            >
              <Gift className="h-5 w-5" />
              Share Your Code Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
