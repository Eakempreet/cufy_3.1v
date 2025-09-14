#!/usr/bin/env python3
"""
CUFY Database Backup - Simple Version
====================================

A simplified script that downloads only the core tables that definitely exist.

Requirements:
    pip install supabase pandas openpyxl

Usage:
    python simple_backup.py
"""

from supabase import create_client
import pandas as pd
from datetime import datetime

# Replace with your Supabase details
url = "https://xdhtrwaghahigmbojotu.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Njk1OTYsImV4cCI6MjA3MTU0NTU5Nn0.ItDXVqjGSI-DaRCCbTCiWbopMnhXLGQiA3DMgBEzS4s"

# Initialize Supabase client
supabase = create_client(url, key)

# Core tables that definitely exist (from your schema)
tables = [
    "users",
    "payments", 
    "subscriptions",
    "profile_assignments",
    "temporary_matches",
    "permanent_matches",
    "user_rounds",
    "user_actions"
]

# Generate filename with timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"cufy_backup_{timestamp}.xlsx"

print(f"📊 Starting backup to {filename}...")

# Create one Excel file with multiple sheets
with pd.ExcelWriter(filename, engine="openpyxl") as writer:
    for table in tables:
        try:
            print(f"📥 Downloading {table}...")
            data = supabase.table(table).select("*").execute()
            
            if data.data:
                df = pd.DataFrame(data.data)
                df.to_excel(writer, sheet_name=table, index=False)
                print(f"✅ {table}: {len(df)} records")
            else:
                print(f"⚠️  {table}: Empty table")
                # Create empty sheet with header
                df = pd.DataFrame({"note": ["Table is empty"]})
                df.to_excel(writer, sheet_name=table, index=False)
                
        except Exception as e:
            print(f"❌ {table}: Error - {str(e)}")
            # Create error sheet
            df = pd.DataFrame({"error": [str(e)]})
            df.to_excel(writer, sheet_name=f"{table}_error", index=False)

print(f"✅ Backup saved as {filename}")
