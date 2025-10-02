import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LeavesService } from './leaves.service';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveWorkflow } from '../workflows/entities/leave-workflow.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { LeaveType } from '../common/enums/leave-type.enum';
import { LeaveStatus } from '../common/enums/leave-status.enum';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('LeavesService', () => {
  let service: LeavesService;
  let leaveRepository: Repository<LeaveRequest>;
  let balanceRepository: Repository<LeaveBalance>;
  let employeeRepository: Repository<Employee>;
  let workflowRepository: Repository<LeaveWorkflow>;
  let dataSource: DataSource;

  const mockLeaveRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockBalanceRepository = {
    find: jest.fn(),
  };

  const mockEmployeeRepository = {
    findOne: jest.fn(),
  };

  const mockWorkflowRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        {
          provide: getRepositoryToken(LeaveRequest),
          useValue: mockLeaveRepository,
        },
        {
          provide: getRepositoryToken(LeaveBalance),
          useValue: mockBalanceRepository,
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        {
          provide: getRepositoryToken(LeaveWorkflow),
          useValue: mockWorkflowRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
    leaveRepository = module.get<Repository<LeaveRequest>>(getRepositoryToken(LeaveRequest));
    balanceRepository = module.get<Repository<LeaveBalance>>(getRepositoryToken(LeaveBalance));
    employeeRepository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    workflowRepository = module.get<Repository<LeaveWorkflow>>(getRepositoryToken(LeaveWorkflow));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apply', () => {
    const mockEmployee = {
      id: '1',
      name: 'Test Employee',
      email: 'test@company.com',
      role: 'EMPLOYEE',
      isActive: true,
    };

    const createLeaveDto: CreateLeaveDto = {
      leaveType: LeaveType.ANNUAL,
      startDate: '2024-12-15',
      endDate: '2024-12-17',
      reason: 'Family vacation',
      documents: undefined,
    };

    it('should successfully apply for leave', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockLeaveRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockLeave = {
        id: '1',
        employeeId: '1',
        leaveType: LeaveType.ANNUAL,
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-17'),
        totalDays: 3,
        reason: 'Family vacation',
        status: LeaveStatus.PENDING_RM,
        appliedAt: new Date(),
      };

      mockLeaveRepository.create.mockReturnValue(mockLeave);
      mockLeaveRepository.save.mockResolvedValue(mockLeave);
      mockWorkflowRepository.create.mockReturnValue({});
      mockWorkflowRepository.save.mockResolvedValue({});

      const result = await service.apply('1', createLeaveDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Leave applied');
      expect(mockLeaveRepository.create).toHaveBeenCalled();
      expect(mockLeaveRepository.save).toHaveBeenCalled();
      expect(mockWorkflowRepository.create).toHaveBeenCalled();
      expect(mockWorkflowRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when employee is not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(service.apply('1', createLeaveDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for past dates', async () => {
      const pastDateDto = {
        ...createLeaveDto,
        startDate: '2020-01-01',
        endDate: '2020-01-03',
      };

      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);

      await expect(service.apply('1', pastDateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for overlapping leaves', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'existing-leave' }),
      };
      mockLeaveRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.apply('1', createLeaveDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for sick leave without medical certificate', async () => {
      const sickLeaveDto = {
        ...createLeaveDto,
        leaveType: LeaveType.SICK,
        startDate: '2024-12-15',
        endDate: '2024-12-20', // 6 days > 3
        documents: undefined,
      };

      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockLeaveRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.apply('1', sickLeaveDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('listMy', () => {
    it('should return user leave requests', async () => {
      const mockLeaves = [
        {
          id: '1',
          employeeId: '1',
          leaveType: LeaveType.ANNUAL,
          startDate: new Date('2024-12-15'),
          endDate: new Date('2024-12-17'),
          totalDays: 3,
          reason: 'Family vacation',
          status: LeaveStatus.PENDING_RM,
          appliedAt: new Date(),
        },
      ];

      mockLeaveRepository.find.mockResolvedValue(mockLeaves);

      const result = await service.listMy('1', {});

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLeaves);
      expect(mockLeaveRepository.find).toHaveBeenCalledWith({
        where: { employeeId: '1' },
        order: { appliedAt: 'DESC' },
      });
    });
  });

  describe('getBalances', () => {
    it('should return user leave balances', async () => {
      const mockBalances = [
        {
          id: '1',
          employeeId: '1',
          leaveType: LeaveType.ANNUAL,
          year: 2024,
          allocated: 12,
          used: 5,
          remaining: 7,
          carryForward: 0,
        },
      ];

      mockBalanceRepository.find.mockResolvedValue(mockBalances);

      const result = await service.getBalances('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBalances);
      expect(mockBalanceRepository.find).toHaveBeenCalledWith({
        where: { employeeId: '1', year: new Date().getFullYear() },
      });
    });
  });
});
