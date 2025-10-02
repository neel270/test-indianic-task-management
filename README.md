# Task Management System - Full Stack Application

A comprehensive full-stack task management application built with React, Node.js, TypeScript, and MongoDB. This application implements all requirements from the practical test including JWT authentication, file uploads, email notifications, real-time communication, and scheduled jobs.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🚀 Core Features (All Requirements Implemented)
- **✅ User Authentication**: JWT-based registration and login with bcrypt password hashing
- **✅ User Profile Management**: Profile image upload with Sharp resizing to 200x200px
- **✅ Task Management**: Full CRUD operations with file attachments (PDF, DOCX, JPG - max 10MB)
- **✅ Email Notifications**: Automated emails for task creation/completion using Nodemailer
- **✅ CSV Export**: Export tasks with ID, Title, Status, Created Date, Due Date
- **✅ Real-time Updates**: WebSocket integration with Socket.io for live task status updates
- **✅ Scheduled Jobs**: Daily 8 AM task reminder emails using node-cron
- **✅ API Documentation**: Comprehensive Swagger documentation

### 🔒 Security Features
- **Role-based Access Control (RBAC)**
- **JWT Authentication with Refresh Tokens**
- **Password Encryption (bcrypt)**
- **Rate Limiting & Security Headers**
- **CORS Protection**
- **Input Validation & Sanitization**
- **File Upload Security**

### 📱 User Experience
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, intuitive interface with shadcn/ui
- **Real-time Notifications**: Toast notifications and WebSocket updates
- **Form Validation**: Client and server-side validation
- **State Management**: Redux Toolkit integration

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and TypeScript
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management with Redux Persist
- **React Query** - Server state management and caching
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components library
- **Socket.io Client** - Real-time communication
- **React Hook Form + Yup** - Form validation

### Backend
- **Node.js** - JavaScript runtime (v20+)
- **Express.js** - Web application framework with TypeScript
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Sharp** - Image processing and resizing
- **Multer** - File upload handling
- **Nodemailer** - Email notifications
- **Socket.io** - Real-time WebSocket communication
- **node-cron** - Scheduled job management
- **Swagger** - API documentation

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Redis** - Session storage and caching (optional)
- **ESLint + Prettier** - Code quality and formatting
- **Jest** - Testing framework
- **Git** - Version control

## 🏗 Architecture

This application follows **Clean Architecture** principles with proper separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 UI Components Layer                     │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │           Redux Toolkit + React Query           │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTP/WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Node.js Backend                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              REST API Layer (Controllers)               │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │            Application Layer (Use Cases)                │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │               Domain Layer (Entities)                   │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │           Infrastructure Layer (External)               │    │
│  │  ┌─────────────────────────────────────────────┐        │    │
│  │  │    MongoDB    │   Redis   │   Email   │     │        │    │
│  │  │   (Mongoose)  │ (Session) │ (Nodemailer)    │        │    │
│  │  └─────────────────────────────────────────────┘        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Layers

#### **Frontend Architecture**
- **UI Components**: Reusable components with shadcn/ui
- **State Management**: Redux Toolkit with Redux Persist
- **Server State**: React Query for API data fetching and caching
- **Real-time**: Socket.io client for WebSocket communication

#### **Backend Architecture (Clean Architecture)**
- **REST API Layer**: Express controllers and routes
- **Application Layer**: Use cases containing business logic
- **Domain Layer**: Core entities and repository interfaces
- **Infrastructure Layer**: External concerns (database, email, file storage)

### Key Design Patterns
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Loose coupling between layers
- **Middleware Pattern**: Request/response processing pipeline
- **Observer Pattern**: Real-time WebSocket communication

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v20 or higher - latest LTS recommended)
- **npm** (v8 or higher)
- **Git**
- **Docker & Docker Compose** (recommended for easy setup)

## 🚀 Quick Start

### Option 1: Docker Setup (Recommended)

1. **Clone and Setup**
```bash
git clone <repository-url>
cd test-indianic-task-management
```

2. **Start with Docker Compose**
```bash
# Copy environment file
cp .env.example .env

# Start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

3. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

### Option 2: Local Development Setup

1. **Clone and Setup**
```bash
git clone <repository-url>
cd test-indianic-task-management
```

2. **Install Dependencies**
```bash
# Install all dependencies from root (monorepo setup)
npm install
```

3. **Configure Environment**
```bash
# Copy and edit root environment file
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)
```

4. **Start Services**
```bash
# Terminal 1: Start MongoDB (local installation required)
sudo systemctl start mongod
# OR: docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Terminal 2: Start both frontend and backend
npm run dev

# OR start individually:
# Backend only: npm run dev:backend
# Frontend only: npm run dev:frontend
```

## 📋 Detailed Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd test-indianic-task-management
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
cd ..
```

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Environment Configuration

#### Copy Environment File
```bash
# Copy root environment file
cp .env.example .env
```

#### Configure Environment Variables

**Root `.env` file:**
```env
# Application Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/task_management
MONGODB_DB_NAME=task_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# File Upload Configuration
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760
MAX_PROFILE_IMAGE_SIZE=5242880
MAX_TASK_FILE_SIZE=10485760

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS with Homebrew
brew services start mongodb-community

# Verify installation
mongo --version
```

#### Option B: Docker MongoDB
```bash
# Start MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=task_management \
  mongo:7.0

# Or using docker-compose (recommended)
docker-compose up mongodb -d
```

#### Option C: MongoDB Atlas (Cloud)
1. Create a cluster at https://mongodb.com/atlas
2. Get connection string and update `MONGODB_URI` in `.env`

### 5. Redis Setup (Optional, for session storage)

#### Option A: Local Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis
```

#### Option B: Docker Redis
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

## 💻 Development Setup

### Start Development Servers

#### Option A: Local Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### Option B: Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## 🚀 Production Deployment

### Option 1: Docker Production (Recommended)

#### Quick Production Setup
```bash
# 1. Copy and configure production environment
cp .env.example .env.production
# Edit .env.production with production values

# 2. Build and deploy
docker-compose -f docker-compose.yml up -d --build

# 3. Or use production profile if available
docker-compose --profile production up -d --build
```

#### Production Environment Variables
```env
# Application Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database Configuration (use strong credentials)
MONGODB_URI=mongodb://username:password@mongodb:27017/task_management
MONGODB_DB_NAME=task_management

# JWT Configuration (use strong, unique secrets)
JWT_SECRET=your-super-secure-production-jwt-secret-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
FROM_EMAIL=your-production-email@gmail.com

# Redis Configuration
REDIS_URL=redis://redis:6379

# File Upload Configuration
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760
MAX_PROFILE_IMAGE_SIZE=5242880
MAX_TASK_FILE_SIZE=10485760

# Security (restrict to your domain)
ALLOWED_ORIGINS=https://yourdomain.com

# Base URL for API
BASE_URL=https://yourdomain.com
```

### Option 2: Manual Production Build

#### Build Frontend
```bash
cd frontend
npm run build
cd ..
```

#### Build Backend
```bash
cd backend
npm run build
cd ..
```

#### Start Production Server
```bash
cd backend
npm start
```

### Option 3: PM2 Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd backend
pm2 start dist/server.js --name "task-management-backend"

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor
pm2 monit
```

## 📧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/task_management` |
| `JWT_SECRET` | JWT secret key (min 32 chars) | `your-super-secret-jwt-key-here` |
| `JWT_REFRESH_SECRET` | JWT refresh secret key | `your-refresh-secret-key-here` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `your-app-password` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `REDIS_URL` | Redis connection URL | `` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) |
| `UPLOAD_DIR` | Upload directory path | `uploads/` |

## 🧪 Testing

### Available Test Commands

#### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test files
npm test auth.api.spec.ts
npm test user.api.spec.ts
```

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint testing with real database
- **Test Coverage**: Comprehensive coverage reports generated

### Testing Stack
- **Jest**: Testing framework
- **Supertest**: HTTP endpoint testing
- **@testing-library/react**: React component testing

## 📚 API Documentation

### Access API Documentation
- **Swagger UI**: http://localhost:5000/api-docs
- **OpenAPI Spec**: Available via Swagger UI

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/verify-otp` - Verify OTP for password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### User Management Endpoints
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/profile-image` - Upload profile image
- `PUT /api/v1/users/change-password` - Change user password

### Task Management Endpoints
- `GET /api/v1/tasks` - Get all tasks (with filters)
- `GET /api/v1/tasks/stats` - Get task statistics
- `GET /api/v1/tasks/export/csv` - Export tasks to CSV
- `GET /api/v1/tasks/:id` - Get task by ID
- `POST /api/v1/tasks` - Create new task (with file uploads)
- `POST /api/v1/tasks/:id` - Update task (with file uploads)
- `DELETE /api/v1/tasks/:id` - Delete task
- `PATCH /api/v1/tasks/:id/completed` - Mark task as completed
- `PATCH /api/v1/tasks/:id/pending` - Mark task as pending

### File Management Endpoints
- `GET /api/v1/tasks/attachments/:userId/:taskId/:filename` - Serve task attachments

### System Endpoints
- `GET /health` - Health check endpoint

## 📁 Project Structure

```
test-indianic-task-management/
│
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI components (shadcn/ui)
│   │   │   └── features/      # Feature-specific components
│   │   ├── pages/             # Page components and routes
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries and configs
│   │   ├── types/             # TypeScript type definitions
│   │   ├── contexts/          # React contexts (Socket, Auth)
│   │   ├── providers/         # Context providers
│   │   └── utils/             # Helper functions
│   ├── public/                # Static assets
│   └── package.json
│
├── backend/                   # Node.js backend application
│   ├── src/
│   │   ├── application/       # Application layer (use cases, DTOs)
│   │   ├── domain/           # Domain layer (entities, repositories)
│   │   ├── infrastructure/   # Infrastructure layer
│   │   │   ├── config/       # Configuration files
│   │   │   ├── database/     # Database connection and models
│   │   │   ├── rest/         # REST API layer (controllers, routes)
│   │   │   ├── services/     # External services (email, redis)
│   │   │   ├── sockets/      # WebSocket implementation
│   │   │   ├── jobs/         # Scheduled jobs (task reminders)
│   │   │   ├── middlewares/  # Express middlewares
│   │   │   └── utils/        # Utility functions
│   │   └── shared/           # Shared constants and types
│   └── package.json
│
├── uploads/                   # File upload directory
├── docker-compose.yml         # Docker orchestration
├── .env.example              # Environment configuration template
└── README.md                 # This file
```

## 🔧 Development Guidelines

### Code Quality
- **TypeScript Strict Mode**: All code follows strict TypeScript configuration
- **ESLint + Prettier**: Automated code formatting and linting
- **Clean Architecture**: Proper separation of concerns across layers
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

### Git Workflow
1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Make changes** following clean architecture principles
3. **Write tests** for new functionality
4. **Run linting**: `npm run lint` in both frontend and backend
5. **Commit with conventional messages**: `git commit -m 'feat: add new feature'`
6. **Push and create PR**: `git push origin feature/your-feature-name`

### Before Committing
```bash
# Backend
cd backend
npm run lint          # Check code quality
npm run format        # Format code
npm test              # Run tests

# Frontend
cd frontend
npm run lint          # Check code quality
npm run format        # Format code
npm test              # Run tests
```

## 📋 Implementation Details

### File Upload System
- **Storage**: Files stored in `/uploads/userId/taskId/` structure
- **Image Processing**: Sharp library resizes profile images to 200x200px
- **Security**: File type validation and size limits enforced
- **Access Control**: JWT-protected file serving endpoints

### Email System
- **Provider**: Nodemailer with Gmail SMTP support
- **Templates**: HTML and plain text templates for all notifications
- **Triggers**: Automatic emails on task creation, completion, and reminders
- **Scheduling**: Daily reminder emails at 8 AM for overdue tasks

### Real-time Features
- **WebSocket Server**: Socket.io server with authentication
- **Events**: Real-time task updates, status changes, and notifications
- **User Tracking**: Online user presence and connection management
- **Room System**: Task-specific collaboration rooms

### Security Measures
- **Authentication**: JWT with refresh token rotation
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: Request throttling with express-rate-limit
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Joi schema validation for all inputs
- **SQL Injection Protection**: Parameterized queries and input sanitization

## 🚨 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs mongodb
```

**Email Configuration Issues:**
```bash
# Test email configuration
cd backend
npm run dev  # Check console for email service errors

# Verify SMTP settings in .env file
# Use app passwords for Gmail (not regular passwords)
```

**File Upload Issues:**
```bash
# Check upload directory permissions
ls -la uploads/

# Verify file size limits in .env
# MAX_FILE_SIZE=10485760 (10MB)
# MAX_PROFILE_IMAGE_SIZE=5242880 (5MB)
```

**WebSocket Connection Issues:**
```bash
# Check if Socket.io server is running
curl http://localhost:5000/health

# Verify CORS settings in .env
# ALLOWED_ORIGINS should include frontend URL
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Getting Help

### Documentation
- **API Documentation**: Available at `/api-docs` when server is running
- **Setup Guide**: Follow the Quick Start instructions above
- **Environment Variables**: See the detailed table in Environment Variables section

### Community Support
- **Report Issues**: Create detailed issue reports with environment information
- **Feature Requests**: Suggest new features through GitHub issues
- **Discussions**: Use GitHub Discussions for questions and help

### Technical Details
- **Node.js Version**: 20+ (Latest LTS recommended)
- **MongoDB Version**: 7.0+
- **Redis Version**: 7+ (optional)
- **Docker**: Latest stable version

---

**Built with ❤️ using Clean Architecture principles**
