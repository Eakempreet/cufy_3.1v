# CUFY Database Backup Tools ✅ WORKING

This directory contains Python scripts to download your entire Supabase database in Excel format.

## 📊 Latest Backup Results

**Last successful backup: September 14, 2025**

- **users**: 353 records ✅
- **payments**: 89 records ✅  
- **subscriptions**: 2 records ✅
- **profile_assignments**: 130 records ✅
- **temporary_matches**: 97 records ✅
- **permanent_matches**: 37 records ✅
- **admin_notes**: 9 records ✅
- **system_settings**: 4 records ✅
- **female_profile_stats**: 55 records ✅
- **user_rounds**: Empty table ⚠️
- **user_actions**: Empty table ⚠️

**Total: 774 records across 11 tables**

## 📋 What You Get

The scripts will create an Excel file with separate sheets for each database table:

- **users** - User profiles and personal information
- **subscriptions** - User subscription data  
- **payments** - Payment records and transaction history
- **profile_assignments** - Female profile assignments to users
- **temporary_matches** - Temporary matching data
- **permanent_matches** - Confirmed permanent matches
- **user_rounds** - User participation in matching rounds
- **user_actions** - User activity and interaction tracking

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable
chmod +x setup_backup.sh

# Run setup (installs required packages)
./setup_backup.sh

# Run the backup
python3 simple_backup.py
```

### Option 2: Manual Setup

```bash
# Install required packages
pip3 install supabase pandas openpyxl

# Run simple backup
python3 simple_backup.py

# OR run advanced backup
python3 download_database.py
```

## 📁 Files Description

### `simple_backup.py`
- **Purpose**: Quick and simple database backup
- **Output**: `cufy_backup_YYYYMMDD_HHMMSS.xlsx`
- **Features**: Basic error handling, essential tables only

### `download_database.py`
- **Purpose**: Advanced backup with comprehensive features
- **Output**: `supabase_backup_YYYY-MM-DD_HH-MM-SS.xlsx`
- **Features**: 
  - Detailed logging and progress tracking
  - Comprehensive error handling
  - File size reporting
  - Backup summary report
  - Attempts to backup all possible tables

### `setup_backup.sh`
- **Purpose**: Automated setup script
- **Features**: 
  - Checks Python/pip installation
  - Installs required packages
  - Provides usage instructions

### `requirements_backup.txt`
- **Purpose**: Python package dependencies
- **Packages**: supabase, pandas, openpyxl, xlsxwriter

## 🔐 Security Notes

The scripts use your Supabase credentials from `.env.local`. These are:
- **URL**: `https://xdhtrwaghahigmbojotu.supabase.co`
- **Key**: Anonymous key (read-only access)

## 📊 Expected Output

After running a backup script, you'll get an Excel file with:
- Multiple sheets (one per database table)
- All records from each table
- Column headers matching your database schema
- Timestamped filename for organization

## 🛠 Troubleshooting

### Common Issues:

1. **Import errors**: Run `pip3 install supabase pandas openpyxl`
2. **Permission errors**: Use the service role key instead of anonymous key
3. **Empty tables**: Some tables might be empty - this is normal
4. **Connection errors**: Check your internet connection and Supabase status

### Getting More Data:

If you need admin-level access to all data, replace the `SUPABASE_KEY` in the script with your service role key:

```python
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4"
```

## 📈 File Size Expectations

Typical backup file sizes:
- **Small dataset** (< 100 users): 50-200 KB
- **Medium dataset** (100-1000 users): 200 KB - 2 MB  
- **Large dataset** (> 1000 users): 2+ MB

## 🔄 Automation

To run backups automatically, you can set up a cron job:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/cufy_3.1v && python3 simple_backup.py
```

## 📞 Support

If you encounter issues:
1. Check the error messages in the terminal
2. Verify your Supabase credentials
3. Ensure all packages are installed correctly
4. Try the simple backup first, then the advanced version
