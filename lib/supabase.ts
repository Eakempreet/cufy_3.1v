import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (use only on server-side)
export const supabaseAdmin = (() => {
  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found, some admin operations may not work')
    // Return regular client as fallback
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone_number: string | null
          age: number
          university: string
          year_of_study: string | null
          profile_photo: string | null
          bio: string
          energy_style: string | null
          group_setting: string | null
          ideal_weekend: string[] | null
          communication_style: string | null
          best_trait: string | null
          relationship_values: string[] | null
          love_language: string | null
          connection_statement: string | null
          instagram: string | null
          gender: 'male' | 'female'
          is_admin: boolean
          subscription_type: 'basic' | 'premium' | null
          subscription_status: 'pending' | 'active' | 'expired' | 'cancelled'
          payment_confirmed: boolean
          payment_proof_url: string | null
          rounds_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone_number?: string | null
          age: number
          university: string
          year_of_study?: string | null
          profile_photo?: string | null
          bio: string
          energy_style?: string | null
          group_setting?: string | null
          ideal_weekend?: string[] | null
          communication_style?: string | null
          best_trait?: string | null
          relationship_values?: string[] | null
          love_language?: string | null
          connection_statement?: string | null
          instagram?: string | null
          gender: 'male' | 'female'
          is_admin?: boolean
          subscription_type?: 'basic' | 'premium' | null
          subscription_status?: 'pending' | 'active' | 'expired' | 'cancelled'
          payment_confirmed?: boolean
          payment_proof_url?: string | null
          rounds_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone_number?: string | null
          age?: number
          university?: string
          year_of_study?: string | null
          profile_photo?: string | null
          bio?: string
          energy_style?: string | null
          group_setting?: string | null
          ideal_weekend?: string[] | null
          communication_style?: string | null
          best_trait?: string | null
          relationship_values?: string[] | null
          love_language?: string | null
          connection_statement?: string | null
          instagram?: string | null
          gender?: 'male' | 'female'
          is_admin?: boolean
          subscription_type?: 'basic' | 'premium' | null
          subscription_status?: 'pending' | 'active' | 'expired' | 'cancelled'
          payment_confirmed?: boolean
          payment_proof_url?: string | null
          rounds_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      profile_assignments: {
        Row: {
          id: string
          male_user_id: string
          female_user_id: string
          status: 'assigned' | 'revealed' | 'disengaged' | 'expired'
          male_revealed: boolean
          female_revealed: boolean
          assigned_at: string
          revealed_at: string | null
          disengaged_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          male_user_id: string
          female_user_id: string
          status?: 'assigned' | 'revealed' | 'disengaged' | 'expired'
          male_revealed?: boolean
          female_revealed?: boolean
          assigned_at?: string
          revealed_at?: string | null
          disengaged_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          male_user_id?: string
          female_user_id?: string
          status?: 'assigned' | 'revealed' | 'disengaged' | 'expired'
          male_revealed?: boolean
          female_revealed?: boolean
          assigned_at?: string
          revealed_at?: string | null
          disengaged_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      temporary_matches: {
        Row: {
          id: string
          assignment_id: string | null
          male_user_id: string
          female_user_id: string
          status: 'active' | 'expired' | 'promoted' | 'disengaged'
          male_decision: 'accept' | 'reject' | null
          female_decision: 'accept' | 'reject' | null
          male_decided_at: string | null
          female_decided_at: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          assignment_id?: string | null
          male_user_id: string
          female_user_id: string
          status?: 'active' | 'expired' | 'promoted' | 'disengaged'
          male_decision?: 'accept' | 'reject' | null
          female_decision?: 'accept' | 'reject' | null
          male_decided_at?: string | null
          female_decided_at?: string | null
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string | null
          male_user_id?: string
          female_user_id?: string
          status?: 'active' | 'expired' | 'promoted' | 'disengaged'
          male_decision?: 'accept' | 'reject' | null
          female_decision?: 'accept' | 'reject' | null
          male_decided_at?: string | null
          female_decided_at?: string | null
          created_at?: string
          expires_at?: string
        }
      }
      permanent_matches: {
        Row: {
          id: string
          temporary_match_id: string | null
          male_user_id: string
          female_user_id: string
          status: 'active' | 'inactive'
          instagram_shared: boolean
          connection_made: boolean
          created_at: string
        }
        Insert: {
          id?: string
          temporary_match_id?: string | null
          male_user_id: string
          female_user_id: string
          status?: 'active' | 'inactive'
          instagram_shared?: boolean
          connection_made?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          temporary_match_id?: string | null
          male_user_id?: string
          female_user_id?: string
          status?: 'active' | 'inactive'
          instagram_shared?: boolean
          connection_made?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          name: string
          type: 'basic' | 'premium'
          price: number
          duration_days: number
          features: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'basic' | 'premium'
          price: number
          duration_days: number
          features?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'basic' | 'premium'
          price?: number
          duration_days?: number
          features?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          subscription_type: 'basic' | 'premium'
          amount: number
          payment_method: string
          payment_proof_url: string | null
          status: 'pending' | 'confirmed' | 'rejected'
          transaction_id: string | null
          admin_notes: string | null
          confirmed_by: string | null
          confirmed_at: string | null
          rejected_at: string | null
          rejected_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_type: 'basic' | 'premium'
          amount: number
          payment_method?: string
          payment_proof_url?: string | null
          status?: 'pending' | 'confirmed' | 'rejected'
          transaction_id?: string | null
          admin_notes?: string | null
          confirmed_by?: string | null
          confirmed_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_type?: 'basic' | 'premium'
          amount?: number
          payment_method?: string
          payment_proof_url?: string | null
          status?: 'pending' | 'confirmed' | 'rejected'
          transaction_id?: string | null
          admin_notes?: string | null
          confirmed_by?: string | null
          confirmed_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_rounds: {
        Row: {
          id: string
          user_id: string
          round_number: number
          profiles_shown: string[] | null
          selected_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          round_number: number
          profiles_shown?: string[] | null
          selected_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          round_number?: number
          profiles_shown?: string[] | null
          selected_user_id?: string | null
          created_at?: string
        }
      }
      user_actions: {
        Row: {
          id: string
          user_id: string
          action_type: string
          target_user_id: string | null
          details: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          target_user_id?: string | null
          details?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          target_user_id?: string | null
          details?: any | null
          created_at?: string
        }
      }
    }
  }
}
