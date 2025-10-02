import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Employee } from '../employees/entities/employee.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let employeeRepository: Repository<Employee>;
  let jwtService: JwtService;

  const mockEmployeeRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    employeeRepository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@company.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const mockEmployee = {
        id: '1',
        email,
        password: hashedPassword,
        name: 'Test User',
        role: 'EMPLOYEE',
        isActive: true,
      };

      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: '1',
        email,
        name: 'Test User',
        role: 'EMPLOYEE',
      });
      expect(mockEmployeeRepository.findOne).toHaveBeenCalledWith({
        where: { email, isActive: true },
      });
    });

    it('should return null when user is not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@company.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@company.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      
      const mockEmployee = {
        id: '1',
        email,
        password: hashedPassword,
        name: 'Test User',
        role: 'EMPLOYEE',
        isActive: true,
      };

      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const email = 'inactive@company.com';
      const password = 'password123';
      
      const mockEmployee = {
        id: '1',
        email,
        password: 'hashedpassword',
        name: 'Inactive User',
        role: 'EMPLOYEE',
        isActive: false,
      };

      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token for valid user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@company.com',
        name: 'Test User',
        role: 'EMPLOYEE',
      };

      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: mockUser,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });
});
