#!/bin/bash

# CUFY Database Backup Runner
# ===========================

echo "🚀 Running CUFY Database Backup..."

# Check if virtual environment exists
if [ ! -d "backup_env" ]; then
    echo "❌ Virtual environment not found. Please run setup_backup.sh first."
    exit 1
fi

# Activate virtual environment
source backup_env/bin/activate

# Check which script to run
if [ "$1" = "advanced" ]; then
    echo "📊 Running advanced backup..."
    python download_database.py
else
    echo "📊 Running simple backup..."
    python simple_backup.py
fi

# Deactivate virtual environment
deactivate

echo "✅ Backup completed!"
