import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { LeaveApproval } from './entities/leave-approval.entity';
import { LeaveWorkflow } from '../workflows/entities/leave-workflow.entity';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveBalance } from '../leaves/entities/leave-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, LeaveApproval, LeaveWorkflow, Employee, LeaveBalance])],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
