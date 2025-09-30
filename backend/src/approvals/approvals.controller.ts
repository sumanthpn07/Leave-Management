import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalsService } from './approvals.service';
import { ApproveLeaveDto } from './dto/approve-leave.dto';

@ApiTags('Approvals')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('approvals/pending')
  @ApiOperation({ summary: 'Get leaves pending my approval' })
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
              appliedAt: { type: 'string', example: '2024-12-01T10:00:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not an approver' })
  pending(@Req() req: any) {
    return this.approvalsService.getPending(req.user);
  }

  @Post('leaves/:id/approve')
  @ApiOperation({ summary: 'Approve a leave request (RM or HR)' })
  @ApiBody({ type: ApproveLeaveDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave approved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Approved' },
        data: {
          type: 'object',
          properties: {
            leave: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                status: { type: 'string', example: 'PENDING_HR' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid stage or insufficient balance' })
  @ApiResponse({ status: 403, description: 'Forbidden - self-approval or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Leave not found' })
  approve(@Req() req: any, @Param('id') id: string, @Body() dto: ApproveLeaveDto) {
    return this.approvalsService.approve(req.user, id, dto);
  }

  @Post('leaves/:id/reject')
  @ApiOperation({ summary: 'Reject a leave request (RM or HR)' })
  @ApiBody({ type: ApproveLeaveDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave rejected successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Rejected' },
        data: {
          type: 'object',
          properties: {
            leave: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                status: { type: 'string', example: 'REJECTED' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - self-approval or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Leave not found' })
  reject(@Req() req: any, @Param('id') id: string, @Body() dto: ApproveLeaveDto) {
    return this.approvalsService.reject(req.user, id, dto);
  }

  @Get('leaves/:id/approval-history')
  @ApiOperation({ summary: 'Get approval history for a leave request' })
  @ApiResponse({ 
    status: 200, 
    description: 'Approval history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            leaveRequest: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                leaveType: { type: 'string', example: 'ANNUAL' },
                startDate: { type: 'string', example: '2024-12-15' },
                endDate: { type: 'string', example: '2024-12-17' },
                totalDays: { type: 'number', example: 3 },
                reason: { type: 'string', example: 'Family vacation' },
                status: { type: 'string', example: 'APPROVED' }
              }
            },
            approvals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid' },
                  approverId: { type: 'string', example: 'uuid' },
                  approverType: { type: 'string', example: 'REPORTING_MANAGER' },
                  action: { type: 'string', example: 'APPROVE' },
                  comments: { type: 'string', example: 'Approved for family function' },
                  timestamp: { type: 'string', example: '2024-12-01T10:30:00Z' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Leave not found' })
  history(@Req() req: any, @Param('id') id: string) {
    return this.approvalsService.history(req.user, id);
  }
}
