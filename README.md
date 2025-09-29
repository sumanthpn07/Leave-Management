# Leave Management System

A comprehensive leave management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Employee leave requests and approvals
- Manager dashboard for leave management
- Calendar view for leave tracking
- Real-time notifications
- Role-based access control

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local` and update the API URL if needed
   - Default API URL: `http://localhost:8000/api`

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

## Tech Stack

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **State Management**: TanStack Query
- **Date Handling**: date-fns, react-datepicker

## Project Structure

```
leave-frontend/
├── app/                    # Next.js app directory
├── components/             # Reusable UI components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── public/                # Static assets
```