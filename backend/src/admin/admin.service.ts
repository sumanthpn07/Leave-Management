import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveBalance } from '../leaves/entities/leave-balance.entity';
import { LeaveStatus } from '../common/enums/leave-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(LeaveRequest) private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(LeaveBalance) private balanceRepo: Repository<LeaveBalance>,
  ) {}

  async getLeaveSummary() {
    const employees = await this.empRepo.find({ where: { isActive: true } });
    const leaves = await this.leaveRepo.find();
    
    const departments = await this.empRepo
      .createQueryBuilder('emp')
      .select('emp.department')
      .addSelect('COUNT(DISTINCT emp.id)', 'totalEmployees')
      .addSelect('COUNT(lr.id)', 'totalLeaves')
      .addSelect('COUNT(CASE WHEN lr.status IN (:...pending) THEN 1 END)', 'pendingApprovals')
      .addSelect('COUNT(CASE WHEN lr.status = :approved THEN 1 END)', 'approvedLeaves')
      .addSelect('COUNT(CASE WHEN lr.status = :rejected THEN 1 END)', 'rejectedLeaves')
      .leftJoin('leave_requests', 'lr', 'lr.employeeId = emp.id')
      .where('emp.isActive = true')
      .groupBy('emp.department')
      .setParameters({
        pending: [LeaveStatus.PENDING_RM, LeaveStatus.PENDING_HR],
        approved: LeaveStatus.APPROVED,
        rejected: LeaveStatus.REJECTED,
      })
      .getRawMany();

    const summary = {
      totalEmployees: employees.length,
      totalLeaves: leaves.length,
      pendingApprovals: leaves.filter(l => [LeaveStatus.PENDING_RM, LeaveStatus.PENDING_HR].includes(l.status)).length,
      approvedLeaves: leaves.filter(l => l.status === LeaveStatus.APPROVED).length,
      rejectedLeaves: leaves.filter(l => l.status === LeaveStatus.REJECTED).length,
    };

    return { success: true, data: { departments, summary } };
  }

  async getPendingApprovals() {
    const pending = await this.leaveRepo
      .createQueryBuilder('lr')
      .leftJoinAndSelect('lr.employee', 'emp')
      .where('lr.status IN (:...statuses)', { statuses: [LeaveStatus.PENDING_RM, LeaveStatus.PENDING_HR] })
      .orderBy('lr.appliedAt', 'DESC')
      .getMany();

    return { success: true, data: pending };
  }
}
