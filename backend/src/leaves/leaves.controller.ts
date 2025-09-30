import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@ApiTags('Leaves')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @ApiOperation({ summary: 'Apply for new leave' })
  @ApiBody({ type: CreateLeaveDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Leave applied successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Leave applied' },
        data: {
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
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  apply(@Req() req: any, @Body() dto: CreateLeaveDto) {
    return this.leavesService.apply(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my leave history' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave history retrieved successfully',
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
  list(@Req() req: any, @Query() query: any) {
    return this.leavesService.listMy(req.user.id, query);
  }

  @Get('balances')
  @ApiOperation({ summary: 'Get my leave balances' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave balances retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              leaveType: { type: 'string', example: 'ANNUAL' },
              allocated: { type: 'number', example: 12 },
              used: { type: 'number', example: 5 },
              remaining: { type: 'number', example: 7 },
              carryForward: { type: 'number', example: 0 }
            }
          }
        }
      }
    }
  })
  balances(@Req() req: any) {
    return this.leavesService.getBalances(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave details by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
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
  })
  @ApiResponse({ status: 404, description: 'Leave not found' })
  get(@Req() req: any, @Param('id') id: string) {
    return this.leavesService.getOne(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a leave (pending only)' })
  @ApiBody({ type: UpdateLeaveDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Leave updated' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            leaveType: { type: 'string', example: 'ANNUAL' },
            startDate: { type: 'string', example: '2024-12-15' },
            endDate: { type: 'string', example: '2024-12-17' },
            totalDays: { type: 'number', example: 3 },
            reason: { type: 'string', example: 'Family vacation' },
            status: { type: 'string', example: 'PENDING_RM' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - only pending leaves can be updated' })
  @ApiResponse({ status: 404, description: 'Leave not found' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLeaveDto) {
    return this.leavesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a leave (pending only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leave cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Leave cancelled' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - only pending leaves can be cancelled' })
  @ApiResponse({ status: 404, description: 'Leave not found' })
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.leavesService.cancel(req.user.id, id);
  }
}
