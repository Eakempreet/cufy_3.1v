#!/bin/bash

# CUFY Database Backup Setup Script
# ==================================

echo "🚀 Setting up CUFY Database Backup Tool..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 found"

# Create virtual environment
echo "🌐 Creating virtual environment..."
if [ ! -d "backup_env" ]; then
    python3 -m venv backup_env
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment. Installing python3-venv..."
        sudo apt update && sudo apt install -y python3-venv python3-full
        python3 -m venv backup_env
    fi
fi

echo "✅ Virtual environment created"

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source backup_env/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install required packages
echo "📦 Installing required packages..."
pip install -r requirements_backup.txt

if [ $? -eq 0 ]; then
    echo "✅ All packages installed successfully!"
    echo ""
    echo "🎉 Setup complete! To run the backup scripts:"
    echo ""
    echo "   1. Activate the environment:"
    echo "      source backup_env/bin/activate"
    echo ""
    echo "   2. Run a backup:"
    echo "      python simple_backup.py"
    echo "      python download_database.py"
    echo ""
    echo "   3. Deactivate when done:"
    echo "      deactivate"
    echo ""
else
    echo "❌ Failed to install packages. Please check your internet connection and try again."
    deactivate
    exit 1
fi

deactivate
