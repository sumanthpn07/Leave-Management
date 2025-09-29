import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User Login',
    description: 'Authenticate user with email and password. Returns JWT token for subsequent requests.'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      example1: {
        summary: 'Employee Login',
        description: 'Login with employee credentials',
        value: {
          email: 'john.doe@company.com',
          password: 'password123'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Login successful' },
        data: {
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
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation errors',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['email must be a valid email'] },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get User Profile',
    description: 'Get the profile information of the authenticated user. Requires JWT token.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Profile retrieved successfully' },
        data: {
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
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async getProfile(@Request() req) {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user,
      },
    };
  }
}
