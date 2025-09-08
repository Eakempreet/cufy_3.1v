#!/usr/bin/env python3
"""
Database Explorer for Cufy Dating App
This script will analyze the entire database schema, policies, and data
"""

import os
from supabase import create_client, Client
import json
from datetime import datetime

# Supabase configuration
SUPABASE_URL = "https://xdhtrwaghahigmbojotu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4"

def main():
    try:
        # Initialize Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("=== CUFY DATABASE ANALYSIS ===")
        print(f"Analysis started at: {datetime.now()}")
        print("=" * 50)
        
        # Get all tables in the database
        print("\n1. ANALYZING DATABASE SCHEMA...")
        tables_query = """
        SELECT table_name, table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
        """
        
        try:
            tables_result = supabase.rpc('execute_sql', {'query': tables_query}).execute()
            print("Tables found:")
            for row in tables_result.data:
                print(f"  - {row['table_name']} ({row['table_type']})")
        except Exception as e:
            print(f"Error getting tables: {e}")
            # Fallback - try to query common tables
            common_tables = ['users', 'profiles', 'payments', 'matches', 'assignments', 'admin_notes']
            print("Fallback - checking common tables:")
            for table in common_tables:
                try:
                    result = supabase.table(table).select("*").limit(1).execute()
                    print(f"  ✓ {table} (exists)")
                except Exception as te:
                    print(f"  ✗ {table} (not found or no access)")
        
        print("\n2. ANALYZING TABLE STRUCTURES...")
        
        # Analyze users table
        print("\n--- USERS TABLE ---")
        try:
            users_result = supabase.table('users').select("*").limit(5).execute()
            print(f"Users sample data ({len(users_result.data)} records shown):")
            for user in users_result.data:
                print(f"  ID: {user.get('id', 'N/A')}")
                print(f"  Email: {user.get('email', 'N/A')}")
                print(f"  Name: {user.get('name', 'N/A')}")
                print(f"  Gender: {user.get('gender', 'N/A')}")
                print(f"  Plan: {user.get('plan_type', 'N/A')}")
                print(f"  Payment Status: {user.get('payment_status', 'N/A')}")
                print("  ---")
        except Exception as e:
            print(f"Error analyzing users: {e}")
        
        # Analyze payments table
        print("\n--- PAYMENTS TABLE ---")
        try:
            payments_result = supabase.table('payments').select("*").limit(5).execute()
            print(f"Payments sample data ({len(payments_result.data)} records shown):")
            for payment in payments_result.data:
                print(f"  ID: {payment.get('id', 'N/A')}")
                print(f"  User ID: {payment.get('user_id', 'N/A')}")
                print(f"  Amount: {payment.get('amount', 'N/A')}")
                print(f"  Status: {payment.get('status', 'N/A')}")
                print(f"  Plan: {payment.get('plan_type', 'N/A')}")
                print("  ---")
        except Exception as e:
            print(f"Error analyzing payments: {e}")
        
        # Analyze profiles table
        print("\n--- PROFILES TABLE ---")
        try:
            profiles_result = supabase.table('profiles').select("*").limit(5).execute()
            print(f"Profiles sample data ({len(profiles_result.data)} records shown):")
            for profile in profiles_result.data:
                print(f"  ID: {profile.get('id', 'N/A')}")
                print(f"  User ID: {profile.get('user_id', 'N/A')}")
                print(f"  Age: {profile.get('age', 'N/A')}")
                print(f"  Location: {profile.get('location', 'N/A')}")
                print(f"  Bio: {profile.get('bio', 'N/A')[:50]}..." if profile.get('bio') else "  Bio: N/A")
                print("  ---")
        except Exception as e:
            print(f"Error analyzing profiles: {e}")
        
        # Check for matches/assignments tables
        print("\n--- MATCHES/ASSIGNMENTS TABLES ---")
        try:
            matches_result = supabase.table('matches').select("*").limit(5).execute()
            print(f"Matches sample data ({len(matches_result.data)} records shown):")
            for match in matches_result.data:
                print(f"  ID: {match.get('id', 'N/A')}")
                print(f"  Male ID: {match.get('male_user_id', 'N/A')}")
                print(f"  Female ID: {match.get('female_user_id', 'N/A')}")
                print(f"  Status: {match.get('status', 'N/A')}")
                print(f"  Created: {match.get('created_at', 'N/A')}")
                print("  ---")
        except Exception as e:
            print(f"Error analyzing matches: {e}")
        
        try:
            assignments_result = supabase.table('assignments').select("*").limit(5).execute()
            print(f"Assignments sample data ({len(assignments_result.data)} records shown):")
            for assignment in assignments_result.data:
                print(f"  ID: {assignment.get('id', 'N/A')}")
                print(f"  Male ID: {assignment.get('male_user_id', 'N/A')}")
                print(f"  Female ID: {assignment.get('female_user_id', 'N/A')}")
                print(f"  Status: {assignment.get('assignment_status', 'N/A')}")
                print("  ---")
        except Exception as e:
            print(f"Error analyzing assignments: {e}")
        
        print("\n3. ANALYZING USER STATISTICS...")
        
        # Count users by gender and plan
        try:
            # Total users
            total_users = supabase.table('users').select("id").execute()
            print(f"Total users: {len(total_users.data)}")
            
            # Male users
            male_users = supabase.table('users').select("id").eq('gender', 'male').execute()
            print(f"Male users: {len(male_users.data)}")
            
            # Female users  
            female_users = supabase.table('users').select("id").eq('gender', 'female').execute()
            print(f"Female users: {len(female_users.data)}")
            
            # Premium users (₹249)
            premium_users = supabase.table('users').select("id").eq('plan_type', 'premium').execute()
            print(f"Premium users: {len(premium_users.data)}")
            
            # Basic users (₹99)
            basic_users = supabase.table('users').select("id").eq('plan_type', 'basic').execute()
            print(f"Basic users: {len(basic_users.data)}")
            
        except Exception as e:
            print(f"Error getting user statistics: {e}")
        
        print("\n4. CHECKING EXISTING POLICIES...")
        try:
            policies_query = """
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
            FROM pg_policies 
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;
            """
            
            policies_result = supabase.rpc('execute_sql', {'query': policies_query}).execute()
            print("RLS Policies found:")
            for policy in policies_result.data:
                print(f"  Table: {policy['tablename']}")
                print(f"  Policy: {policy['policyname']}")
                print(f"  Command: {policy['cmd']}")
                print(f"  Roles: {policy['roles']}")
                print("  ---")
                
        except Exception as e:
            print(f"Error getting policies: {e}")
        
        print("\n=== ANALYSIS COMPLETE ===")
        print("Database structure has been analyzed successfully!")
        
    except Exception as e:
        print(f"Critical error: {e}")
        print("Please check your Supabase credentials and connection.")

if __name__ == "__main__":
    main()
