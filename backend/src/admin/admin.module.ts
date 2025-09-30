import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveBalance } from '../leaves/entities/leave-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, Employee, LeaveBalance])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
