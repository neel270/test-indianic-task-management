# Task Management Backend

A comprehensive task management system built with Node.js, TypeScript, and clean architecture principles. This backend provides complete authentication, task management, real-time features, and file handling capabilities.

## 🚀 Features

### Authentication System
- **User Registration & Login** with JWT tokens
- **Password Management** with secure hashing
- **Forgot Password** with OTP verification
- **Role-based Access Control** (Admin/User)
- **Token Refresh** functionality

### Task Management
- **Full CRUD Operations** for tasks
- **Pagination Support** for large datasets
- **Advanced Filtering** by status, date range, priority
- **Task Status Management** (Pending/Completed)
- **Priority Levels** (Low/Medium/High)
- **Tag Support** for task categorization
- **File Attachments** support

### Real-time Features
- **Socket.io Integration** for real-time updates
- **Live Task Notifications**
- **User Online Status** tracking
- **Collaborative Task Editing** indicators

### Background Jobs
- **Task Reminders** with configurable timing
- **Overdue Task Notifications**
- **Automated Email Notifications** (configurable)

### File Management
- **Image Upload & Processing** with Sharp
- **File Attachment Support**
- **CSV Export** for tasks and users
- **Image Resizing & Optimization**

## 🏗️ Architecture

This project follows **Clean Architecture** principles with proper separation of concerns:

```
backend/
├── src/
│   ├── domain/                 # Business logic layer
│   │   ├── entities/          # Domain entities
│   │   ├── repositories/      # Repository interfaces
│   │   └── value-objects/     # Value objects
│   ├── application/           # Use cases layer
│   │   ├── dtos/             # Data transfer objects
│   │   ├── services/         # Application services
│   │   └── use-cases/        # Use case implementations
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── config/           # Configuration files
│   │   ├── database/         # Database setup
│   │   ├── middlewares/      # Express middlewares
│   │   ├── repositories/     # Repository implementations
│   │   ├── rest/            # REST API layer
│   │   ├── sockets/         # Socket.io setup
│   │   ├── jobs/           # Background jobs
│   │   └── utils/          # Utility functions
│   └── shared/              # Shared resources
├── test/                   # Test files
└── uploads/               # File uploads directory
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT tokens
- **Real-time**: Socket.io
- **File Processing**: Multer + Sharp
- **Validation**: Joi
- **Password Hashing**: bcrypt
- **Email**: Nodemailer (configurable)
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis (optional, for caching)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/taskdb

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=uploads/
MAX_PROFILE_IMAGE_SIZE=5242880
MAX_TASK_FILE_SIZE=10485760

# Email Configuration (optional)
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_SERVICE_URL=https://api.emailservice.com

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Frontend URL (for email templates)
FRONTEND_URL=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "reset-token-here",
  "newPassword": "newpassword123"
}
```

### Task Management Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the task management system",
  "dueDate": "2024-12-31T23:59:59Z",
  "priority": "High",
  "tags": ["urgent", "development"]
}
```

#### Get Tasks (with pagination)
```http
GET /api/tasks?page=1&limit=10&status=Pending&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Update Task
```http
PUT /api/tasks/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "Completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/{id}
Authorization: Bearer <token>
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run all tests
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e        # Run e2e tests
npm run test:coverage   # Run tests with coverage

# Database
npm run db:migrate      # Run database migrations
npm run db:generate     # Generate new migration
npm run db:revert       # Revert last migration

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint errors
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test complete user flows

Run tests with:
```bash
npm run test
```

## 📁 Project Structure

### Domain Layer (`src/domain/`)
- **Entities**: Business objects with behavior
- **Value Objects**: Immutable objects with validation
- **Repositories**: Data access interfaces

### Application Layer (`src/application/`)
- **DTOs**: Data transfer objects for validation
- **Services**: Application-specific business logic
- **Use Cases**: Application use case implementations

### Infrastructure Layer (`src/infrastructure/`)
- **REST API**: Controllers and routes
- **Database**: Models and migrations
- **Sockets**: Real-time communication
- **Jobs**: Background processing
- **Utils**: Helper functions

## 🔒 Security Features

- **Password Hashing** with bcrypt
- **JWT Authentication** with refresh tokens
- **Input Validation** with Joi
- **CORS Protection**
- **Helmet Security Headers**
- **Rate Limiting** (configurable)

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
docker build -t task-management-backend .
docker run -p 3000:3000 task-management-backend
```

## 📊 Monitoring

The application includes:
- **Request Logging** with Winston
- **Error Tracking** and reporting
- **Performance Monitoring** hooks
- **Health Check Endpoints**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using Clean Architecture principles**
