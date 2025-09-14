#!/usr/bin/env python3
"""
CUFY Dating Platform - Complete Database Backup Script
======================================================

This script downloads the entire Supabase database and saves it as an Excel file
with multiple sheets, one for each table.

Requirements:
    pip install supabase pandas openpyxl

Usage:
    python download_database.py

Output:
    supabase_backup_YYYY-MM-DD_HH-MM-SS.xlsx
"""

from supabase import create_client
import pandas as pd
from datetime import datetime
import os
import sys

# Supabase Configuration
# These credentials are from your .env.local file
SUPABASE_URL = "https://xdhtrwaghahigmbojotu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Njk1OTYsImV4cCI6MjA3MTU0NTU5Nn0.ItDXVqjGSI-DaRCCbTCiWbopMnhXLGQiA3DMgBEzS4s"

# For admin access, you might want to use the service role key:
# SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4"

def main():
    try:
        # Initialize Supabase client
        print("🔗 Connecting to Supabase...")
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected successfully!")
        
        # All tables in your database (based on schema analysis)
        tables = [
            "users",                    # Core user profiles
            "subscriptions",           # User subscription data
            "payments",                # Payment records
            "profile_assignments",     # Female profile assignments
            "temporary_matches",       # Temporary matching data
            "permanent_matches",       # Confirmed permanent matches
            "user_rounds",            # User round participation
            "user_actions",           # User activity tracking
            "admin_notes",            # Admin notes (if exists)
            "system_settings",        # System configuration (if exists)
            "boys_entry_control",     # Boys registration control (if exists)
            "female_profile_stats",   # Female profile statistics (if exists)
        ]
        
        # Generate timestamped filename
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"supabase_backup_{timestamp}.xlsx"
        
        print(f"📊 Starting database backup to {filename}...")
        
        # Create Excel writer
        with pd.ExcelWriter(filename, engine="openpyxl") as writer:
            successful_tables = []
            failed_tables = []
            
            for table in tables:
                try:
                    print(f"📥 Downloading {table}...")
                    
                    # Fetch all data from the table
                    response = supabase.table(table).select("*").execute()
                    
                    if response.data:
                        # Convert to DataFrame and save to Excel sheet
                        df = pd.DataFrame(response.data)
                        df.to_excel(writer, sheet_name=table, index=False)
                        print(f"✅ {table}: {len(df)} records downloaded")
                        successful_tables.append(table)
                    else:
                        print(f"⚠️  {table}: Table is empty")
                        # Create empty DataFrame with message
                        df = pd.DataFrame({"message": ["Table is empty"]})
                        df.to_excel(writer, sheet_name=table, index=False)
                        successful_tables.append(table)
                        
                except Exception as e:
                    print(f"❌ {table}: Failed to download - {str(e)}")
                    failed_tables.append(table)
                    
                    # Create error sheet
                    try:
                        error_df = pd.DataFrame({
                            "error": [f"Failed to download table: {str(e)}"],
                            "table": [table],
                            "timestamp": [datetime.now().isoformat()]
                        })
                        sheet_name = f"{table}_ERROR"[:31]  # Excel sheet name limit
                        error_df.to_excel(writer, sheet_name=sheet_name, index=False)
                    except:
                        pass  # Skip if even error sheet fails
        
        # Summary report
        print("\n" + "="*60)
        print("📊 BACKUP SUMMARY")
        print("="*60)
        print(f"✅ Successful tables ({len(successful_tables)}):")
        for table in successful_tables:
            print(f"   - {table}")
            
        if failed_tables:
            print(f"\n❌ Failed tables ({len(failed_tables)}):")
            for table in failed_tables:
                print(f"   - {table}")
        
        print(f"\n💾 Backup saved as: {filename}")
        print(f"📁 File location: {os.path.abspath(filename)}")
        
        # File size
        file_size = os.path.getsize(filename) / (1024 * 1024)  # MB
        print(f"📦 File size: {file_size:.2f} MB")
        
        print("\n🎉 Database backup completed successfully!")
        
    except Exception as e:
        print(f"\n💥 CRITICAL ERROR: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Check your internet connection")
        print("2. Verify Supabase credentials")
        print("3. Ensure you have the required packages: pip install supabase pandas openpyxl")
        print("4. Check if you have permission to access the tables")
        sys.exit(1)

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = ['supabase', 'pandas', 'openpyxl']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print(f"\n📦 Install them with: pip install {' '.join(missing_packages)}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 CUFY Database Backup Tool")
    print("="*50)
    
    # Check dependencies
    check_dependencies()
    
    # Run main backup process
    main()
