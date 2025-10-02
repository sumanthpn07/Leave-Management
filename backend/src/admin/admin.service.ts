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
    
    // Use raw SQL query to get proper field names
    const departments = await this.empRepo.query(`
      SELECT 
        emp.department,
        COUNT(DISTINCT emp.id) as "totalEmployees",
        COUNT(lr.id) as "totalLeaves",
        COUNT(CASE WHEN lr.status IN ('PENDING_RM', 'PENDING_HR') THEN 1 END) as "pendingApprovals",
        COUNT(CASE WHEN lr.status = 'APPROVED' THEN 1 END) as "approvedLeaves",
        COUNT(CASE WHEN lr.status = 'REJECTED' THEN 1 END) as "rejectedLeaves"
      FROM employees emp
      LEFT JOIN leave_requests lr ON lr."employeeId" = emp.id
      WHERE emp."isActive" = true
      GROUP BY emp.department
      ORDER BY emp.department
    `);

    // Convert to proper format
    const departmentStats = departments.map(dept => ({
      department: dept.department || 'Unknown',
      totalEmployees: parseInt(dept.totalEmployees) || 0,
      totalLeaves: parseInt(dept.totalLeaves) || 0,
      pendingApprovals: parseInt(dept.pendingApprovals) || 0,
      approvedLeaves: parseInt(dept.approvedLeaves) || 0,
      rejectedLeaves: parseInt(dept.rejectedLeaves) || 0,
    }));

    const summary = {
      totalEmployees: employees.length,
      totalLeaves: leaves.length,
      pendingApprovals: leaves.filter(l => [LeaveStatus.PENDING_RM, LeaveStatus.PENDING_HR].includes(l.status)).length,
      approvedLeaves: leaves.filter(l => l.status === LeaveStatus.APPROVED).length,
      rejectedLeaves: leaves.filter(l => l.status === LeaveStatus.REJECTED).length,
    };

    return { success: true, data: { departments: departmentStats, summary } };
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
