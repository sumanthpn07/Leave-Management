# Leave Management System - Backend

A simple NestJS backend API for the Leave Management System.

## Project Structure

```
backend/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── auth.controller.ts  # Auth endpoints
│   │   ├── auth.service.ts     # Auth business logic
│   │   └── auth.module.ts      # Auth module
│   ├── employees/              # Employee management (future)
│   ├── leaves/                 # Leave management (future)
│   ├── common/                 # Shared utilities
│   │   ├── enums/             # Enums for roles, statuses, etc.
│   │   └── dto/               # Common DTOs
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
├── test/                       # Test files (future)
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run start:dev
```

3. The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /auth/login` - User login

#### Sample Users
- **Employee**: john.doe@company.com / password123
- **Manager**: jane.smith@company.com / password123  
- **Admin**: mike.wilson@company.com / password123
- **Employee**: sarah.jones@company.com / password123

## Sample API Usage

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "password123"
  }'
```

## Development

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server

## Future Features

- JWT Authentication
- Database integration (PostgreSQL)
- Leave management APIs
- Employee management
- Approval workflows
- Admin dashboard APIs
