import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('leave-summary')
  @ApiOperation({ summary: 'Get department-wise leave statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            departments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  department: { type: 'string', example: 'Engineering' },
                  totalEmployees: { type: 'number', example: 25 },
                  totalLeaves: { type: 'number', example: 45 },
                  pendingApprovals: { type: 'number', example: 8 },
                  approvedLeaves: { type: 'number', example: 35 },
                  rejectedLeaves: { type: 'number', example: 2 }
                }
              }
            },
            summary: {
              type: 'object',
              properties: {
                totalEmployees: { type: 'number', example: 100 },
                totalLeaves: { type: 'number', example: 150 },
                pendingApprovals: { type: 'number', example: 25 },
                approvedLeaves: { type: 'number', example: 120 },
                rejectedLeaves: { type: 'number', example: 5 }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  leaveSummary(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Admin access required');
    }
    return this.adminService.getLeaveSummary();
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get all pending approvals across organization' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pending approvals retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              employeeId: { type: 'string', example: 'uuid' },
              leaveType: { type: 'string', example: 'ANNUAL' },
              startDate: { type: 'string', example: '2024-12-15' },
              endDate: { type: 'string', example: '2024-12-17' },
              totalDays: { type: 'number', example: 3 },
              reason: { type: 'string', example: 'Family vacation' },
              status: { type: 'string', example: 'PENDING_RM' },
              appliedAt: { type: 'string', example: '2024-12-01T10:00:00Z' },
              employee: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  department: { type: 'string', example: 'Engineering' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  pendingApprovals(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Admin access required');
    }
    return this.adminService.getPendingApprovals();
  }
}
