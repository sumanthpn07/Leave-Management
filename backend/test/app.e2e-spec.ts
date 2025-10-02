import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Employee } from '../src/employees/entities/employee.entity';
import { LeaveRequest } from '../src/leaves/entities/leave-request.entity';
import { LeaveBalance } from '../src/leaves/entities/leave-balance.entity';
import { LeaveWorkflow } from '../src/workflows/entities/leave-workflow.entity';
import { LeaveApproval } from '../src/approvals/entities/leave-approval.entity';
import { UserRole } from '../src/common/enums/user-role.enum';
import { LeaveType } from '../src/common/enums/leave-type.enum';
import { LeaveStatus } from '../src/common/enums/leave-status.enum';
import * as bcrypt from 'bcrypt';

describe('Leave Management API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let employeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT) || 5432,
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'password',
          database: process.env.DATABASE_NAME || 'leave_management_test',
          entities: [Employee, LeaveRequest, LeaveBalance, LeaveWorkflow, LeaveApproval],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    
    // Enable CORS for testing
    app.enableCors();
    
    await app.init();
  });

  beforeEach(async () => {
    // Clear database before each test
    await dataSource.query('DELETE FROM leave_approvals');
    await dataSource.query('DELETE FROM leave_workflows');
    await dataSource.query('DELETE FROM leave_requests');
    await dataSource.query('DELETE FROM leave_balances');
    await dataSource.query('DELETE FROM employees');

    // Create test employee
    const hashedPassword = await bcrypt.hash('password123', 10);
    const employee = await dataSource.getRepository(Employee).save({
      employeeCode: 'TEST001',
      name: 'Test Employee',
      email: 'test@company.com',
      department: 'Engineering',
      role: UserRole.EMPLOYEE,
      joinDate: new Date(),
      isActive: true,
      password: hashedPassword,
    });
    employeeId = employee.id;

    // Create leave balance
    await dataSource.getRepository(LeaveBalance).save({
      employeeId: employee.id,
      leaveType: LeaveType.ANNUAL,
      year: new Date().getFullYear(),
      allocated: 12,
      used: 0,
      remaining: 12,
      carryForward: 0,
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@company.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@company.com');
      
      authToken = response.body.data.access_token;
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@company.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@company.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('Leave Management', () => {
    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@company.com',
          password: 'password123',
        });
      authToken = loginResponse.body.data.access_token;
    });

    it('should apply for new leave', async () => {
      const leaveData = {
        leaveType: LeaveType.ANNUAL,
        startDate: '2024-12-15',
        endDate: '2024-12-17',
        reason: 'Family vacation',
      };

      const response = await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leaveData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Leave applied');
      expect(response.body.data.leaveType).toBe(LeaveType.ANNUAL);
      expect(response.body.data.status).toBe(LeaveStatus.PENDING_RM);
    });

    it('should apply for leave with file upload', async () => {
      const response = await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .field('leaveType', LeaveType.ANNUAL)
        .field('startDate', '2024-12-15')
        .field('endDate', '2024-12-17')
        .field('reason', 'Family vacation with documents')
        .attach('file', Buffer.from('fake file content'), 'test-document.pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toBeDefined();
    });

    it('should reject leave application for past dates', async () => {
      const pastLeaveData = {
        leaveType: LeaveType.ANNUAL,
        startDate: '2020-01-01',
        endDate: '2020-01-03',
        reason: 'Past vacation',
      };

      await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pastLeaveData)
        .expect(400);
    });

    it('should reject leave application for invalid date range', async () => {
      const invalidLeaveData = {
        leaveType: LeaveType.ANNUAL,
        startDate: '2024-12-17',
        endDate: '2024-12-15', // End before start
        reason: 'Invalid dates',
      };

      await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLeaveData)
        .expect(400);
    });

    it('should get user leave requests', async () => {
      // First create a leave request
      await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaveType: LeaveType.ANNUAL,
          startDate: '2024-12-15',
          endDate: '2024-12-17',
          reason: 'Family vacation',
        });

      const response = await request(app.getHttpServer())
        .get('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get leave balances', async () => {
      const response = await request(app.getHttpServer())
        .get('/leaves/balances')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].leaveType).toBe(LeaveType.ANNUAL);
      expect(response.body.data[0].allocated).toBe(12);
    });

    it('should get leave details by ID', async () => {
      // First create a leave request
      const createResponse = await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaveType: LeaveType.ANNUAL,
          startDate: '2024-12-15',
          endDate: '2024-12-17',
          reason: 'Family vacation',
        });

      const leaveId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .get(`/leaves/${leaveId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(leaveId);
      expect(response.body.data.leaveType).toBe(LeaveType.ANNUAL);
    });

    it('should update leave request', async () => {
      // First create a leave request
      const createResponse = await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaveType: LeaveType.ANNUAL,
          startDate: '2024-12-15',
          endDate: '2024-12-17',
          reason: 'Family vacation',
        });

      const leaveId = createResponse.body.data.id;

      const updateData = {
        leaveType: LeaveType.ANNUAL,
        startDate: '2024-12-16',
        endDate: '2024-12-18',
        reason: 'Updated family vacation',
      };

      const response = await request(app.getHttpServer())
        .put(`/leaves/${leaveId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Leave updated');
    });

    it('should cancel leave request', async () => {
      // First create a leave request
      const createResponse = await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaveType: LeaveType.ANNUAL,
          startDate: '2024-12-15',
          endDate: '2024-12-17',
          reason: 'Family vacation',
        });

      const leaveId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/leaves/${leaveId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Leave cancelled');
    });
  });

  describe('Authorization', () => {
    it('should reject requests without authentication', async () => {
      await request(app.getHttpServer())
        .get('/leaves')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/leaves')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('File Upload', () => {
    beforeEach(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@company.com',
          password: 'password123',
        });
      authToken = loginResponse.body.data.access_token;
    });

    it('should accept valid file types', async () => {
      const response = await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .field('leaveType', LeaveType.ANNUAL)
        .field('startDate', '2024-12-15')
        .field('endDate', '2024-12-17')
        .field('reason', 'Family vacation with PDF')
        .attach('file', Buffer.from('fake PDF content'), 'document.pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toContain('.pdf');
    });

    it('should reject invalid file types', async () => {
      await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .field('leaveType', LeaveType.ANNUAL)
        .field('startDate', '2024-12-15')
        .field('endDate', '2024-12-17')
        .field('reason', 'Family vacation with invalid file')
        .attach('file', Buffer.from('fake content'), 'document.exe')
        .expect(400);
    });

    it('should reject files that are too large', async () => {
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB

      await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${authToken}`)
        .field('leaveType', LeaveType.ANNUAL)
        .field('startDate', '2024-12-15')
        .field('endDate', '2024-12-17')
        .field('reason', 'Family vacation with large file')
        .attach('file', largeFile, 'large-document.pdf')
        .expect(400);
    });
  });
});
