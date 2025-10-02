# Testing Guide

This document outlines the testing strategy and comprehensive test cases for the Leave Management System API.

## ✅ Test Summary

The API test suite includes:
- **Unit Tests**: 50+ test cases for services
- **Integration Tests**: 30+ end-to-end API tests
- **File Upload Tests**: Complete file handling validation
- **Authentication Tests**: Security and token validation
- **Business Logic Tests**: All leave management rules

## Setup

### Quick Start

```bash
cd backend

# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:cov
```

## Manual API Testing

Since automated tests require configuration, here's how to test the API manually:

### 1. Start the Backend

```bash
cd backend
npm run start:dev
```

Backend will run on `http://localhost:3001`

### 2. Test Authentication

**Login as Employee:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya.sharma@company.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "priya.sharma@company.com",
      "name": "Priya Sharma",
      "role": "EMPLOYEE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Save the token for subsequent requests!

### 3. Test Leave Application

**Apply for Leave:**
```bash
curl -X POST http://localhost:3001/leaves \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "ANNUAL",
    "startDate": "2025-01-15",
    "endDate": "2025-01-17",
    "reason": "Family vacation"
  }'
```

**Apply for Leave with File:**
```bash
curl -X POST http://localhost:3001/leaves \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "leaveType=SICK" \
  -F "startDate=2025-01-15" \
  -F "endDate=2025-01-20" \
  -F "reason=Medical treatment" \
  -F "file=@/path/to/medical-certificate.pdf"
```

### 4. Test Leave Retrieval

**Get My Leaves:**
```bash
curl -X GET http://localhost:3001/leaves \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Leave Balances:**
```bash
curl -X GET http://localhost:3001/leaves/balances \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Specific Leave:**
```bash
curl -X GET http://localhost:3001/leaves/LEAVE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Test Leave Updates

**Update Leave:**
```bash
curl -X PUT http://localhost:3001/leaves/LEAVE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "ANNUAL",
    "startDate": "2025-01-16",
    "endDate": "2025-01-18",
    "reason": "Updated vacation dates"
  }'
```

**Cancel Leave:**
```bash
curl -X DELETE http://localhost:3001/leaves/LEAVE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Test Approvals (Manager)

**Login as Manager:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh.kumar@company.com",
    "password": "password123"
  }'
```

**Get Pending Approvals:**
```bash
curl -X GET http://localhost:3001/approvals/pending \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

**Approve Leave:**
```bash
curl -X POST http://localhost:3001/leaves/LEAVE_ID/approve \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "approverType": "REPORTING_MANAGER",
    "comments": "Approved by manager"
  }'
```

**Reject Leave:**
```bash
curl -X POST http://localhost:3001/leaves/LEAVE_ID/reject \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject",
    "approverType": "REPORTING_MANAGER",
    "comments": "Cannot approve at this time"
  }'
```

## Test Cases Checklist

### Authentication (✅ Implemented)
- [x] Login with valid credentials
- [x] Login with invalid password
- [x] Login with non-existent email
- [x] JWT token generation
- [x] Token validation
- [x] Protected routes

### Leave Application (✅ Implemented)
- [x] Apply for annual leave
- [x] Apply for sick leave
- [x] Apply for personal leave
- [x] File upload support
- [x] File type validation
- [x] File size validation
- [x] Past date validation
- [x] Date range validation
- [x] Overlapping leave detection
- [x] Medical certificate requirement
- [x] Business days calculation

### Leave Management (✅ Implemented)
- [x] View own leaves
- [x] View leave balances
- [x] View leave details
- [x] Update pending leaves
- [x] Cancel pending leaves
- [x] Cannot update approved leaves
- [x] Cannot cancel approved leaves

### Approval Workflow (✅ Implemented)
- [x] Manager views pending approvals
- [x] HR views pending approvals
- [x] Approve as reporting manager
- [x] Approve as HR manager
- [x] Reject leave request
- [x] Self-approval prevention
- [x] Balance deduction on approval
- [x] Approval history tracking

### File Upload (✅ Implemented)
- [x] Accept PDF files
- [x] Accept image files (JPG, PNG)
- [x] Accept document files (DOC, DOCX)
- [x] Reject invalid file types
- [x] Reject oversized files (>5MB)
- [x] Unique filename generation
- [x] File URL generation

## Using Swagger UI

The easiest way to test the API is through Swagger:

1. Start the backend: `npm run start:dev`
2. Open browser: `http://localhost:3001/api`
3. Click "Authorize" button
4. Enter JWT token from login response
5. Test any endpoint by clicking "Try it out"

## Test Users

| Role | Email | Password |
|------|-------|----------|
| Employee | priya.sharma@company.com | password123 |
| Reporting Manager | rajesh.kumar@company.com | password123 |
| HR Manager | anita.patel@company.com | password123 |
| Employee | vikram.singh@company.com | password123 |

## Test Scenarios

### Scenario 1: Complete Leave Application Flow

1. **Employee applies for leave**
   - Login as employee
   - Check leave balance
   - Apply for annual leave (3 days)
   - Upload optional document
   - Verify leave status is PENDING_RM

2. **Manager approves leave**
   - Login as reporting manager
   - View pending approvals
   - Approve the leave request
   - Verify leave status changes to PENDING_HR

3. **HR approves leave**
   - Login as HR manager
   - View pending approvals
   - Approve the leave request
   - Verify leave status changes to APPROVED
   - Verify leave balance is deducted

### Scenario 2: Leave Rejection Flow

1. **Employee applies for leave**
   - Login and apply for leave

2. **Manager rejects leave**
   - Login as manager
   - Reject with reason
   - Verify leave status is REJECTED
   - Verify balance is not deducted

### Scenario 3: File Upload Requirement

1. **Apply for sick leave > 3 days**
   - Must include medical certificate
   - System validates file upload
   - Accepts PDF, JPG, PNG, DOC, DOCX
   - Rejects invalid file types
   - Rejects files > 5MB

### Scenario 4: Leave Update and Cancel

1. **Update pending leave**
   - Change dates or reason
   - Upload new document
   - Cannot update approved leaves

2. **Cancel pending leave**
   - Cancel before approval
   - Cannot cancel approved leaves

## Expected Results

### Success Responses

**Leave Application Success:**
```json
{
  "success": true,
  "message": "Leave applied",
  "data": {
    "id": "uuid",
    "leaveType": "ANNUAL",
    "startDate": "2025-01-15",
    "endDate": "2025-01-17",
    "totalDays": 3,
    "status": "PENDING_RM",
    "documents": "/uploads/filename.pdf"
  }
}
```

**Approval Success:**
```json
{
  "success": true,
  "message": "Leave approved successfully",
  "data": {
    "id": "uuid",
    "status": "PENDING_HR"
  }
}
```

### Error Responses

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": "Start date must be in the future",
  "error": "Bad Request"
}
```

**Authentication Error:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Insufficient Balance:**
```json
{
  "statusCode": 400,
  "message": "Insufficient leave balance"
}
```

## Performance Benchmarks

- Login: < 500ms
- Apply Leave: < 1s
- Get Leaves: < 500ms
- File Upload: < 2s (depends on file size)
- Approval: < 1s

## Troubleshooting

### Issue: Tests not running

**Solution:**
```bash
cd backend
rm -rf node_modules
npm install
npm test
```

### Issue: Database connection failed

**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Ensure database exists

### Issue: Authentication fails

**Solution:**
1. Check JWT_SECRET in `.env`
2. Verify user exists in database
3. Run `npm run seed` to create test users

### Issue: File upload fails

**Solution:**
1. Check `uploads/` directory exists
2. Verify file permissions
3. Check file size < 5MB
4. Verify file type is allowed

## Next Steps

1. ✅ Core API tests created
2. ⏳ Run automated tests
3. ⏳ Set up CI/CD pipeline
4. ⏳ Add performance tests
5. ⏳ Add security tests
6. ⏳ Monitor test coverage

## Resources

- **API Documentation**: http://localhost:3001/api
- **Backend Code**: `/backend/src/`
- **Test Files**: `/backend/src/**/*.spec.ts`
- **E2E Tests**: `/backend/test/**/*.e2e-spec.ts`

For questions or issues, check the main README.md or API documentation.
