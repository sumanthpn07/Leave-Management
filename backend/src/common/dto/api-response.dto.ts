import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty()
  data: T;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: ['email must be a valid email'] })
  message: string[];
}

export class LoginResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ba2f06ad-54ba-4b05-8296-33bba6fc98e9' },
          employeeCode: { type: 'string', example: 'EMP001' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john.doe@company.com' },
          department: { type: 'string', example: 'Engineering' },
          role: { type: 'string', example: 'EMPLOYEE' },
          reportingManagerId: { type: 'string', example: 'c3d4e5f6-78g9-4h0i-9j1k-2l3m4n5o6p7q' },
          joinDate: { type: 'string', example: '2024-01-15' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
          updatedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
        }
      },
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    }
  })
  data: {
    user: any;
    token: string;
  };
}

export class ProfileResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Profile retrieved successfully' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ba2f06ad-54ba-4b05-8296-33bba6fc98e9' },
          employeeCode: { type: 'string', example: 'EMP001' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john.doe@company.com' },
          department: { type: 'string', example: 'Engineering' },
          role: { type: 'string', example: 'EMPLOYEE' },
          reportingManagerId: { type: 'string', example: 'c3d4e5f6-78g9-4h0i-9j1k-2l3m4n5o6p7q' },
          joinDate: { type: 'string', example: '2024-01-15' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
          updatedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
        }
      }
    }
  })
  data: {
    user: any;
  };
}
