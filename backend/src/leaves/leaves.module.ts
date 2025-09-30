import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveWorkflow } from '../workflows/entities/leave-workflow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, LeaveBalance, Employee, LeaveWorkflow])],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}
