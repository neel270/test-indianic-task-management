#!/bin/bash

echo "🚀 Task Management Application Setup"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is required but not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js (version 18+) first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Copy environment files if they don't exist
if [ ! -f .env ]; then
    echo "📄 Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration"
else
    echo "📄 .env file already exists"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies  
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your configuration (especially database and email settings)"
echo "2. Start the services:"
echo "   - For development: npm run dev:all"
echo "   - For production with Docker: docker-compose up -d"
echo ""
echo "Available scripts:"
echo "- npm run dev:backend  - Start backend development server"
echo "- npm run dev:frontend - Start frontend development server" 
echo "- npm run dev:all      - Start both backend and frontend"
echo "- npm run docker:dev   - Start with Docker for development"
echo "- npm run docker:prod  - Start with Docker for production"
echo ""
echo "API Documentation will be available at: http://localhost:3001/api-docs"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "📚 Don't forget to:"
echo "   - Configure your Gmail app password for email notifications"
echo "   - Set up MongoDB (included in docker-compose.yml)"
echo "   - Set up Redis for session management (included in docker-compose.yml)"