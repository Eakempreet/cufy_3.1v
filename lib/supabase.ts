import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone_number: string
          age: number
          university: string
          year_of_study: string
          profile_photo: string | null
          bio: string
          energy_style: string
          group_setting: string
          ideal_weekend: string[]
          communication_style: string
          best_trait: string
          relationship_values: string[]
          love_language: string
          connection_statement: string
          gender: 'male' | 'female'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone_number: string
          age: number
          university: string
          year_of_study: string
          profile_photo?: string | null
          bio: string
          energy_style: string
          group_setting: string
          ideal_weekend: string[]
          communication_style: string
          best_trait: string
          relationship_values: string[]
          love_language: string
          connection_statement: string
          gender: 'male' | 'female'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone_number?: string
          age?: number
          university?: string
          year_of_study?: string
          profile_photo?: string | null
          bio?: string
          energy_style?: string
          group_setting?: string
          ideal_weekend?: string[]
          communication_style?: string
          best_trait?: string
          relationship_values?: string[]
          love_language?: string
          connection_statement?: string
          gender?: 'male' | 'female'
          created_at?: string
          updated_at?: string
        }
      }
      auth_users: {
        Row: {
          id: string
          email: string
          google_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          google_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          google_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
