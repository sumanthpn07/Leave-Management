# Leave Management System

A comprehensive, full-stack leave management system built with modern web technologies. This system provides a complete solution for managing employee leave requests, approvals, and tracking with role-based access control.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ 
- **PostgreSQL** 12+
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Leave-Management
```

### 2. Database Setup

1. **Install PostgreSQL** and create a database:
```sql
CREATE DATABASE leave_management;
```

2. **Set up environment variables** for the backend:
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your database credentials:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=leave_management
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=3001
```

### 3. Backend Setup

```bash
cd backend
npm install
npm run seed
npm run start:dev
```

The backend API will be available at `http://localhost:3001`
- **API Documentation**: `http://localhost:3001/api`
- **File Uploads**: `http://localhost:3001/uploads/`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📋 System Overview

### Architecture

- **Frontend**: Next.js 13 with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: NestJS with TypeScript, PostgreSQL database
- **Authentication**: JWT-based authentication with role-based access control
- **File Upload**: Multer for handling document uploads
- **API Documentation**: Swagger/OpenAPI integration

### User Roles

1. **Employee**: Can apply for leave, view own requests and balances
2. **Reporting Manager**: Can approve/reject leave requests from their team
3. **HR Manager**: Can approve/reject all leave requests
4. **Admin**: Full system access, can manage all aspects

## 🎯 Core Features

### For Employees

#### 📝 Leave Application
- **Intuitive Form**: Easy-to-use leave application form with validation
- **Leave Types**: Annual, Sick, and Personal leave options
- **Date Selection**: Calendar-based date picker with business day calculation
- **File Upload**: Support for medical certificates and supporting documents
- **Real-time Validation**: Form validation with helpful error messages
- **Progress Tracking**: Visual progress indicators during submission

#### 📊 Dashboard
- **Leave Balances**: View available leave days by type
- **Recent Requests**: Quick overview of recent leave applications
- **Upcoming Leaves**: See approved upcoming leave dates
- **Quick Actions**: Fast access to apply for new leave

#### 📋 Leave Management
- **Request History**: Complete history of all leave requests
- **Status Tracking**: Real-time status updates (Pending, Approved, Rejected)
- **Edit Requests**: Modify pending requests before approval
- **Cancel Requests**: Cancel pending leave requests
- **Document Management**: Upload and view supporting documents

### For Managers

#### ✅ Approval Workflow
- **Pending Approvals**: Dashboard showing all pending requests
- **Quick Actions**: Approve or reject requests with comments
- **Team Overview**: View team members' leave status
- **Bulk Operations**: Handle multiple requests efficiently

#### 📈 Reporting
- **Team Analytics**: Overview of team leave patterns
- **Approval History**: Track all approval decisions
- **Leave Trends**: Identify patterns in leave requests

### For HR Managers

#### 🏢 Organization-wide Management
- **All Requests**: View and manage all leave requests across the organization
- **Policy Management**: Configure leave policies and rules
- **Reporting**: Generate comprehensive leave reports
- **Employee Management**: Manage employee leave balances

### For Administrators

#### ⚙️ System Administration
- **User Management**: Manage all system users and roles
- **System Configuration**: Configure system-wide settings
- **Analytics Dashboard**: Comprehensive system analytics
- **Data Management**: Import/export data and system maintenance

## 🛠 Technical Features

### Backend Features

#### 🔐 Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions based on user roles
- **Password Hashing**: Secure password storage with bcrypt
- **Session Management**: Automatic token refresh and logout

#### 📊 Database Design
- **Employee Management**: Complete employee profiles with roles and departments
- **Leave Requests**: Comprehensive leave request tracking
- **Leave Balances**: Yearly leave balance management with carry-forward
- **Approval Workflow**: Multi-stage approval process
- **Audit Trail**: Complete history of all actions

#### 🔄 API Features
- **RESTful APIs**: Well-structured REST endpoints
- **File Upload**: Secure file upload with validation
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Detailed error responses
- **API Documentation**: Auto-generated Swagger documentation

### Frontend Features

#### 🎨 User Interface
- **Responsive Design**: Mobile-first responsive design
- **Modern UI**: Clean, intuitive interface with shadcn/ui components
- **Dark/Light Mode**: Theme support for user preference
- **Accessibility**: WCAG compliant interface

#### ⚡ Performance
- **Server-side Rendering**: Next.js SSR for better performance
- **Code Splitting**: Automatic code splitting for optimal loading
- **Caching**: Intelligent caching for API responses
- **Optimized Images**: Automatic image optimization

#### 🔧 Developer Experience
- **TypeScript**: Full type safety throughout the application
- **Hot Reload**: Instant development feedback
- **Linting**: Code quality enforcement
- **Testing**: Comprehensive test coverage

## 📁 Project Structure

```
Leave-Management/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── employees/      # Employee management
│   │   ├── leaves/         # Leave management
│   │   ├── approvals/      # Approval workflow
│   │   ├── admin/          # Admin functionality
│   │   ├── common/         # Shared utilities
│   │   └── database/       # Database seeds and migrations
│   ├── uploads/            # File upload directory
│   └── package.json
├── frontend/               # Next.js Frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript definitions
│   └── package.json
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=leave_management
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=3001
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚀 Deployment

### Development
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

### Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 📊 Database Schema

### Core Entities

#### Employee
- Employee information, roles, and authentication
- Hierarchical reporting structure
- Department and organizational data

#### Leave Request
- Leave application details
- Status tracking through approval workflow
- Document attachments
- Audit trail

#### Leave Balance
- Yearly leave allocations
- Used and remaining days
- Carry-forward calculations

#### Approval Workflow
- Multi-stage approval process
- Approval history and comments
- Role-based approval routing

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation on all inputs
- **File Upload Security**: File type and size validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **SQL Injection Protection**: TypeORM query builder protection

## 📱 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Leave Management
- `GET /leaves` - Get user's leave requests
- `POST /leaves` - Apply for new leave
- `GET /leaves/:id` - Get leave details
- `PUT /leaves/:id` - Update leave request
- `DELETE /leaves/:id` - Cancel leave request
- `GET /leaves/balances` - Get leave balances

### Approvals
- `GET /approvals/pending` - Get pending approvals
- `POST /leaves/:id/approve` - Approve leave request
- `POST /leaves/:id/reject` - Reject leave request

### Admin
- `GET /admin/leave-summary` - Get organization leave summary
- `GET /admin/pending-approvals` - Get all pending approvals

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test

