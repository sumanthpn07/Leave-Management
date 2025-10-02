# 🚀 Quick Test Guide

## Run Tests Right Now

```bash
# 1. Navigate to backend
cd backend

# 2. Run all tests
npm test
```

## Test Commands

```bash
# Run all unit tests
npm test

# Run with coverage report
npm run test:cov

# Run in watch mode (auto-rerun)
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test auth.service.spec

# Debug tests
npm run test:debug
```

## Manual API Testing (Using cURL)

### 1. Start Backend
```bash
cd backend
npm run start:dev
```

### 2. Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@company.com","password":"password123"}'
```

**Copy the token from response!**

### 3. Apply for Leave
```bash
curl -X POST http://localhost:3001/leaves \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType":"ANNUAL",
    "startDate":"2025-01-15",
    "endDate":"2025-01-17",
    "reason":"Vacation"
  }'
```

### 4. Get My Leaves
```bash
curl -X GET http://localhost:3001/leaves \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Get Leave Balances
```bash
curl -X GET http://localhost:3001/leaves/balances \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Using Swagger UI (Easiest Method)

1. Start backend: `npm run start:dev`
2. Open: **http://localhost:3001/api**
3. Click "Authorize" button
4. Enter JWT token from login
5. Test any endpoint!

## Test Users

| Email | Password | Role |
|-------|----------|------|
| priya.sharma@company.com | password123 | Employee |
| rajesh.kumar@company.com | password123 | Manager |
| anita.patel@company.com | password123 | HR Manager |

## What's Been Created

✅ **75+ Test Cases** covering:
- Authentication (12 tests)
- Leave Management (15 tests)
- Approvals (10 tests)
- File Upload (8 tests)
- E2E Tests (30+ tests)

## Test Files Location

```
backend/
├── src/**/*.spec.ts        ← Unit tests
└── test/**/*.e2e-spec.ts   ← E2E tests
```

## Quick Verification

```bash
cd backend

# Check if tests exist
ls src/**/*.spec.ts

# Run a quick test
npm test -- auth.service.spec.ts
```

## Need Help?

- **Full Guide**: See `docs/TESTING.md`
- **Test Summary**: See `TEST_SUMMARY.md`
- **API Docs**: http://localhost:3001/api

## Expected Test Output

```
PASS  src/auth/auth.service.spec.ts
PASS  src/leaves/leaves.service.spec.ts
PASS  src/approvals/approvals.service.spec.ts
PASS  src/common/services/file-upload.service.spec.ts

Test Suites: 4 passed, 4 total
Tests:       45 passed, 45 total
Time:        5.234 s
```

That's it! You're ready to test! 🎉
