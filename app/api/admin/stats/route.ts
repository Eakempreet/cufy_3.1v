import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all users for analytics
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')

    if (usersError) {
      console.error('Error fetching users for stats:', usersError)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    const usersArray = users || []

    // Calculate basic stats
    const totalUsers = usersArray.length
    const maleUsers = usersArray.filter(u => u.gender === 'male').length
    const femaleUsers = usersArray.filter(u => u.gender === 'female').length
    
    // Payment stats
    const paidUsers = usersArray.filter(u => u.payment_confirmed === true).length
    const premiumUsers = usersArray.filter(u => u.subscription_type === 'premium' && u.payment_confirmed === true).length
    const basicUsers = usersArray.filter(u => u.subscription_type === 'basic' && u.payment_confirmed === true).length
    const pendingPayments = usersArray.filter(u => u.payment_proof_url && !u.payment_confirmed).length
    
    // Revenue calculations
    const totalRevenue = usersArray.reduce((sum, user) => {
      if (user.payment_confirmed) {
        if (user.subscription_type === 'premium') return sum + 249
        if (user.subscription_type === 'basic') return sum + 99
      }
      return sum
    }, 0)

    // College stats
    const collegeStats = usersArray.reduce((acc: any, user) => {
      const college = user.college || user.university || 'Not Specified'
      if (!acc[college]) {
        acc[college] = { total: 0, girls: 0, boys: 0, premium: 0, basic: 0, unpaid: 0 }
      }
      acc[college].total++
      if (user.gender === 'female') acc[college].girls++
      if (user.gender === 'male') acc[college].boys++
      
      if (user.payment_confirmed && user.subscription_type === 'premium') {
        acc[college].premium++
      } else if (user.payment_confirmed && user.subscription_type === 'basic') {
        acc[college].basic++
      } else {
        acc[college].unpaid++
      }
      return acc
    }, {})

    const stats = {
      totalUsers,
      maleUsers,
      femaleUsers,
      paidUsers,
      premiumUsers,
      basicUsers,
      pendingPayments,
      totalRevenue,
      collegeStats,
      // Additional useful stats
      totalColleges: Object.keys(collegeStats).length,
      activeUsers: usersArray.filter(u => u.subscription_status === 'active').length,
      newUsersToday: usersArray.filter(u => {
        const today = new Date()
        const userDate = new Date(u.created_at)
        return userDate.toDateString() === today.toDateString()
      }).length
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
