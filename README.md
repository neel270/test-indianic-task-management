# 🚚 Courier Service - Full Stack Application

A modern, full-stack courier service management application built with React, Node.js, TypeScript, and MongoDB. This application follows industry best practices for scalable web development.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Production](#production)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🚀 Core Features
- **User Management**: Complete user lifecycle management with role-based access
- **Task Management**: Create, assign, and track delivery tasks
- **Real-time Updates**: Live tracking and status updates
- **Authentication**: Secure JWT-based authentication system
- **Dashboard**: Comprehensive analytics and reporting dashboard

### 🔒 Security Features
- **Role-based Access Control (RBAC)**
- **JWT Authentication**
- **Password Encryption**
- **Rate Limiting**
- **CORS Protection**
- **Input Validation**

### 📱 User Experience
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, intuitive interface
- **Real-time Notifications**: Toast notifications and alerts
- **Form Validation**: Client and server-side validation

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Git** - Version control

## 🏗 Architecture

This application follows a modern, scalable architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│   Nginx Proxy    │◄──►│   Node.js API   │
│   (Frontend)    │    │   (Optional)      │    │   (Backend)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Redux       │    │   Express        │    │    MongoDB      │
│   (State Mgmt)  │    │   (Web Server)   │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Architecture Patterns
- **MVC Pattern**: Model-View-Controller for backend
- **Component Architecture**: Reusable React components
- **Service Layer**: Business logic separation
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Request/response processing

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (v7.0 or higher)
- **Redis** (optional, for caching)
- **Git**
- **Docker** (optional, for containerized deployment)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd courier-service
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```

#### Backend Dependencies
```bash
cd backend
npm install --legacy-peer-deps
cd ..
```

### 3. Environment Configuration

#### Copy Environment Files
```bash
# Root environment file
cp .env.example .env

# Backend environment file
cp backend/.env.example backend/.env

# Frontend environment file (if needed)
cp frontend/.env.example frontend/.env
```

#### Configure Environment Variables
Edit the `.env` file with your specific configuration:

```env
# Database
MONGO_USERNAME=your-username
MONGO_PASSWORD=your-password
MONGO_DATABASE=task-indianic

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or using brew (macOS)
brew services start mongodb-community
```

#### Option B: Docker MongoDB
```bash
# Start only MongoDB
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

## 💻 Development

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
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

## 🏭 Production

### Build for Production

#### Option A: Local Production
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start backend
npm start
```

#### Option B: Docker Production
```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d --build

# Or for production profile
docker-compose --profile production up -d --build
```

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=your-production-secret-key
MONGO_USERNAME=your-production-username
MONGO_PASSWORD=your-production-password
```

## 🧪 Testing

### Run Tests

#### Frontend Tests
```bash
cd frontend
npm test
npm run test:watch
npm run test:coverage
```

#### Backend Tests
```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component/function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user journey testing

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### User Management Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Task Management Endpoints
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 📁 Project Structure

```
courier-service/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API layer
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── utils/         # Utility functions
│   │   └── tests/         # Test files
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Custom middlewares
│   │   ├── models/        # Database models
│   │   ├── repositories/  # Data repositories
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── tests/         # Test files
│   └── package.json
│
├── docker-compose.yml     # Docker orchestration
├── .env.example          # Environment template
└── README.md             # This file
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Ensure code passes linting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. **Check the documentation** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Contact the development team**

## 🔄 Updates

Stay updated with the latest changes:

- **Releases**: Check the [releases page](https://github.com/your-repo/releases)
- **Changelog**: View [CHANGELOG.md](CHANGELOG.md)
- **Migration Guide**: See [MIGRATION.md](MIGRATION.md) for breaking changes

---

**Happy coding! 🚀**
