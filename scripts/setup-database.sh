#!/bin/bash

# Database Setup Script for Crew Image Generator
# This script will create the database and populate it with sample data

echo "🚀 Setting up Crew Management Database..."

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL not found. Please install MySQL first."
    echo "macOS: brew install mysql"
    echo "Ubuntu: sudo apt install mysql-server"
    exit 1
fi

# Get database credentials
read -p "Enter MySQL username (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Enter MySQL password: " DB_PASS
echo

read -p "Enter database name (default: CrewManagement): " DB_NAME
DB_NAME=${DB_NAME:-CrewManagement}

read -p "Enter database host (default: 127.0.0.1): " DB_HOST
DB_HOST=${DB_HOST:-127.0.0.1}

# Test connection
echo "🔍 Testing MySQL connection..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to MySQL. Please check your credentials."
    exit 1
fi

echo "✅ MySQL connection successful!"

# Create database and tables
echo "📋 Creating database schema..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully!"
else
    echo "❌ Failed to create database schema."
    exit 1
fi

# Insert sample data
echo "🌱 Seeding database with sample data..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" < database/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Sample data inserted successfully!"
else
    echo "❌ Failed to insert sample data."
    exit 1
fi

# Create .env file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_NAME=$DB_NAME

# Server Configuration
PORT=8080

# Development/Production
NODE_ENV=development
EOF

echo "✅ Environment file created: .env"

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Make sure your backend is using database mode in crew.controller.ts"
echo "2. Start your backend: npm run dev"
echo "3. Your app should now connect to the database!"
echo ""
echo "📊 Sample data includes:"
echo "   • 5 boat types (8+, 4+, 4-, 2x, 1x)"
echo "   • 5 sample crews with complete lineups"
echo "   • Various rowing clubs and competitions"