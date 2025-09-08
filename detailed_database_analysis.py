#!/usr/bin/env python3
"""
Database Explorer for Cufy Dating App - Detailed Analysis
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
        
        print("=== DETAILED CUFY DATABASE ANALYSIS ===")
        print(f"Analysis started at: {datetime.now()}")
        print("=" * 60)
        
        # Check actual table structures
        print("\n1. EXISTING TABLES ANALYSIS...")
        
        # Users table - detailed analysis
        print("\n--- USERS TABLE DETAILED ---")
        users_result = supabase.table('users').select("*").limit(3).execute()
        if users_result.data:
            print("Sample user record structure:")
            user = users_result.data[0]
            for key, value in user.items():
                print(f"  {key}: {value} ({type(value).__name__})")
        
        # Check subscription types and payment status
        print("\n--- USER STATISTICS ---")
        total_users = supabase.table('users').select("id").execute()
        print(f"Total users: {len(total_users.data)}")
        
        # Check subscription types (using the correct column name)
        premium_users = supabase.table('users').select("id").eq('subscription_type', 'premium').execute()
        basic_users = supabase.table('users').select("id").eq('subscription_type', 'basic').execute()
        print(f"Premium users: {len(premium_users.data)}")
        print(f"Basic users: {len(basic_users.data)}")
        
        # Check payment confirmed users
        paid_users = supabase.table('users').select("id").eq('payment_confirmed', True).execute()
        print(f"Payment confirmed users: {len(paid_users.data)}")
        
        # Check payments table
        print("\n--- PAYMENTS TABLE DETAILED ---")
        payments_result = supabase.table('payments').select("*").limit(3).execute()
        if payments_result.data:
            print("Sample payment record structure:")
            payment = payments_result.data[0]
            for key, value in payment.items():
                print(f"  {key}: {value} ({type(value).__name__})")
        
        # Payment statistics
        confirmed_payments = supabase.table('payments').select("id").eq('status', 'confirmed').execute()
        pending_payments = supabase.table('payments').select("id").eq('status', 'pending').execute()
        print(f"Confirmed payments: {len(confirmed_payments.data)}")
        print(f"Pending payments: {len(pending_payments.data)}")
        
        # Check profile_assignments table
        print("\n--- PROFILE_ASSIGNMENTS TABLE ---")
        try:
            assignments_result = supabase.table('profile_assignments').select("*").limit(3).execute()
            if assignments_result.data:
                print("Sample assignment record structure:")
                assignment = assignments_result.data[0]
                for key, value in assignment.items():
                    print(f"  {key}: {value} ({type(value).__name__})")
            else:
                print("No assignments found")
        except Exception as e:
            print(f"Error: {e}")
        
        # Check temporary_matches table
        print("\n--- TEMPORARY_MATCHES TABLE ---")
        try:
            temp_matches_result = supabase.table('temporary_matches').select("*").limit(3).execute()
            if temp_matches_result.data:
                print("Sample temporary match record structure:")
                temp_match = temp_matches_result.data[0]
                for key, value in temp_match.items():
                    print(f"  {key}: {value} ({type(value).__name__})")
            else:
                print("No temporary matches found")
        except Exception as e:
            print(f"Error: {e}")
        
        # Check permanent_matches table
        print("\n--- PERMANENT_MATCHES TABLE ---")
        try:
            perm_matches_result = supabase.table('permanent_matches').select("*").limit(3).execute()
            if perm_matches_result.data:
                print("Sample permanent match record structure:")
                perm_match = perm_matches_result.data[0]
                for key, value in perm_match.items():
                    print(f"  {key}: {value} ({type(value).__name__})")
            else:
                print("No permanent matches found")
        except Exception as e:
            print(f"Error: {e}")
        
        # Check user_rounds table
        print("\n--- USER_ROUNDS TABLE ---")
        try:
            rounds_result = supabase.table('user_rounds').select("*").limit(3).execute()
            if rounds_result.data:
                print("Sample user round record structure:")
                round_data = rounds_result.data[0]
                for key, value in round_data.items():
                    print(f"  {key}: {value} ({type(value).__name__})")
            else:
                print("No user rounds found")
        except Exception as e:
            print(f"Error: {e}")
        
        # Check admin_notes table
        print("\n--- ADMIN_NOTES TABLE ---")
        try:
            admin_notes_result = supabase.table('admin_notes').select("*").limit(3).execute()
            if admin_notes_result.data:
                print("Sample admin note record structure:")
                note = admin_notes_result.data[0]
                for key, value in note.items():
                    print(f"  {key}: {value} ({type(value).__name__})")
            else:
                print("No admin notes found")
        except Exception as e:
            print(f"Error: {e}")
        
        print("\n2. BUSINESS LOGIC ANALYSIS...")
        
        # Check premium vs basic plan distribution
        print("\n--- SUBSCRIPTION ANALYSIS ---")
        premium_confirmed = supabase.table('users').select("id").eq('subscription_type', 'premium').eq('payment_confirmed', True).execute()
        basic_confirmed = supabase.table('users').select("id").eq('subscription_type', 'basic').eq('payment_confirmed', True).execute()
        
        print(f"Premium users with confirmed payment: {len(premium_confirmed.data)}")
        print(f"Basic users with confirmed payment: {len(basic_confirmed.data)}")
        
        # Gender distribution with confirmed payments
        male_premium_paid = supabase.table('users').select("id").eq('gender', 'male').eq('subscription_type', 'premium').eq('payment_confirmed', True).execute()
        male_basic_paid = supabase.table('users').select("id").eq('gender', 'male').eq('subscription_type', 'basic').eq('payment_confirmed', True).execute()
        female_paid = supabase.table('users').select("id").eq('gender', 'female').eq('payment_confirmed', True).execute()
        
        print(f"Male Premium (₹249) paid users: {len(male_premium_paid.data)}")
        print(f"Male Basic (₹99) paid users: {len(male_basic_paid.data)}")
        print(f"Female paid users: {len(female_paid.data)}")
        
        print("\n=== ANALYSIS COMPLETE ===")
        print("Ready to implement the admin panel and matching system!")
        
    except Exception as e:
        print(f"Critical error: {e}")

if __name__ == "__main__":
    main()
