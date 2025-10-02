import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalsService } from './approvals.service';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { LeaveApproval } from './entities/leave-approval.entity';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveWorkflow } from '../workflows/entities/leave-workflow.entity';
import { ApprovalAction } from '../common/enums/approval-action.enum';
import { ApproverType } from '../common/enums/approver-type.enum';
import { LeaveStatus } from '../common/enums/leave-status.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ApprovalsService', () => {
  let service: ApprovalsService;
  let leaveRepository: Repository<LeaveRequest>;
  let approvalRepository: Repository<LeaveApproval>;
  let employeeRepository: Repository<Employee>;
  let workflowRepository: Repository<LeaveWorkflow>;

  const mockLeaveRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockApprovalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockEmployeeRepository = {
    findOne: jest.fn(),
  };

  const mockWorkflowRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        {
          provide: getRepositoryToken(LeaveRequest),
          useValue: mockLeaveRepository,
        },
        {
          provide: getRepositoryToken(LeaveApproval),
          useValue: mockApprovalRepository,
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        {
          provide: getRepositoryToken(LeaveWorkflow),
          useValue: mockWorkflowRepository,
        },
      ],
    }).compile();

    service = module.get<ApprovalsService>(ApprovalsService);
    leaveRepository = module.get<Repository<LeaveRequest>>(getRepositoryToken(LeaveRequest));
    approvalRepository = module.get<Repository<LeaveApproval>>(getRepositoryToken(LeaveApproval));
    employeeRepository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    workflowRepository = module.get<Repository<LeaveWorkflow>>(getRepositoryToken(LeaveWorkflow));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPendingApprovals', () => {
    it('should return pending approvals for manager', async () => {
      const mockLeaves = [
        {
          id: '1',
          employeeId: '1',
          leaveType: 'ANNUAL',
          startDate: new Date('2024-12-15'),
          endDate: new Date('2024-12-17'),
          totalDays: 3,
          reason: 'Family vacation',
          status: LeaveStatus.PENDING_RM,
          appliedAt: new Date(),
          employee: {
            id: '1',
            name: 'Test Employee',
            email: 'test@company.com',
          },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockLeaves),
      };
      mockLeaveRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPendingApprovals('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLeaves);
    });
  });

  describe('approveLeave', () => {
    const mockLeave = {
      id: '1',
      employeeId: '1',
      leaveType: 'ANNUAL',
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-17'),
      totalDays: 3,
      reason: 'Family vacation',
      status: LeaveStatus.PENDING_RM,
      appliedAt: new Date(),
    };

    const mockWorkflow = {
      id: '1',
      leaveRequestId: '1',
      currentStage: 'PENDING_RM',
    };

    const mockApprover = {
      id: '2',
      name: 'Manager',
      email: 'manager@company.com',
      role: 'REPORTING_MANAGER',
    };

    it('should approve leave request successfully', async () => {
      mockLeaveRepository.findOne.mockResolvedValue(mockLeave);
      mockWorkflowRepository.findOne.mockResolvedValue(mockWorkflow);
      mockEmployeeRepository.findOne.mockResolvedValue(mockApprover);

      const updatedLeave = { ...mockLeave, status: LeaveStatus.PENDING_HR };
      mockLeaveRepository.save.mockResolvedValue(updatedLeave);

      const mockApproval = {
        id: '1',
        leaveRequestId: '1',
        approverId: '2',
        action: ApprovalAction.APPROVE,
        approverType: ApproverType.REPORTING_MANAGER,
        comments: 'Approved by manager',
        approvedAt: new Date(),
      };
      mockApprovalRepository.create.mockReturnValue(mockApproval);
      mockApprovalRepository.save.mockResolvedValue(mockApproval);

      const result = await service.approveLeave('1', {
        action: ApprovalAction.APPROVE,
        approverType: ApproverType.REPORTING_MANAGER,
        comments: 'Approved by manager',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Leave approved successfully');
      expect(mockLeaveRepository.save).toHaveBeenCalled();
      expect(mockApprovalRepository.create).toHaveBeenCalled();
      expect(mockApprovalRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when leave is not found', async () => {
      mockLeaveRepository.findOne.mockResolvedValue(null);

      await expect(service.approveLeave('nonexistent', {
        action: ApprovalAction.APPROVE,
        approverType: ApproverType.REPORTING_MANAGER,
        comments: 'Approved',
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when leave is not in pending status', async () => {
      const approvedLeave = { ...mockLeave, status: LeaveStatus.APPROVED };
      mockLeaveRepository.findOne.mockResolvedValue(approvedLeave);

      await expect(service.approveLeave('1', {
        action: ApprovalAction.APPROVE,
        approverType: ApproverType.REPORTING_MANAGER,
        comments: 'Approved',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectLeave', () => {
    const mockLeave = {
      id: '1',
      employeeId: '1',
      leaveType: 'ANNUAL',
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-17'),
      totalDays: 3,
      reason: 'Family vacation',
      status: LeaveStatus.PENDING_RM,
      appliedAt: new Date(),
    };

    const mockApprover = {
      id: '2',
      name: 'Manager',
      email: 'manager@company.com',
      role: 'REPORTING_MANAGER',
    };

    it('should reject leave request successfully', async () => {
      mockLeaveRepository.findOne.mockResolvedValue(mockLeave);
      mockEmployeeRepository.findOne.mockResolvedValue(mockApprover);

      const rejectedLeave = { ...mockLeave, status: LeaveStatus.REJECTED };
      mockLeaveRepository.save.mockResolvedValue(rejectedLeave);

      const mockApproval = {
        id: '1',
        leaveRequestId: '1',
        approverId: '2',
        action: ApprovalAction.REJECT,
        approverType: ApproverType.REPORTING_MANAGER,
        comments: 'Rejected by manager',
        approvedAt: new Date(),
      };
      mockApprovalRepository.create.mockReturnValue(mockApproval);
      mockApprovalRepository.save.mockResolvedValue(mockApproval);

      const result = await service.rejectLeave('1', {
        action: ApprovalAction.REJECT,
        approverType: ApproverType.REPORTING_MANAGER,
        comments: 'Rejected by manager',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Leave rejected successfully');
      expect(mockLeaveRepository.save).toHaveBeenCalled();
      expect(mockApprovalRepository.create).toHaveBeenCalled();
      expect(mockApprovalRepository.save).toHaveBeenCalled();
    });
  });

  describe('getApprovalHistory', () => {
    it('should return approval history for a leave request', async () => {
      const mockApprovals = [
        {
          id: '1',
          leaveRequestId: '1',
          approverId: '2',
          action: ApprovalAction.APPROVE,
          approverType: ApproverType.REPORTING_MANAGER,
          comments: 'Approved by manager',
          approvedAt: new Date(),
          approver: {
            id: '2',
            name: 'Manager',
            email: 'manager@company.com',
          },
        },
      ];

      mockApprovalRepository.find.mockResolvedValue(mockApprovals);

      const result = await service.getApprovalHistory('1');

      expect(result.success).toBe(true);
      expect(result.data.approvals).toEqual(mockApprovals);
      expect(mockApprovalRepository.find).toHaveBeenCalledWith({
        where: { leaveRequestId: '1' },
        relations: ['approver'],
        order: { approvedAt: 'ASC' },
      });
    });
  });
});
