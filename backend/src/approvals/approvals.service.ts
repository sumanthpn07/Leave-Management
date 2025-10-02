import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { LeaveApproval } from './entities/leave-approval.entity';
import { LeaveWorkflow } from '../workflows/entities/leave-workflow.entity';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveStatus } from '../common/enums/leave-status.enum';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { ApproverType } from '../common/enums/approver-type.enum';
import { ApprovalAction } from '../common/enums/approval-action.enum';
import { LeaveBalance } from '../leaves/entities/leave-balance.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(LeaveRequest) private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveApproval) private approvalRepo: Repository<LeaveApproval>,
    @InjectRepository(LeaveWorkflow) private wfRepo: Repository<LeaveWorkflow>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(LeaveBalance) private balanceRepo: Repository<LeaveBalance>,
    private dataSource: DataSource,
  ) {}

  private ensureApproverRole(user: Employee, type: ApproverType) {
    if (type === ApproverType.REPORTING_MANAGER && user.role !== UserRole.REPORTING_MANAGER) {
      throw new ForbiddenException('Only reporting managers can perform this action');
    }
    if (type === ApproverType.HR_MANAGER && user.role !== UserRole.HR_MANAGER) {
      throw new ForbiddenException('Only HR managers can perform this action');
    }
  }

  async getPending(user: Employee) {
    if (![UserRole.REPORTING_MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Not an approver');
    }

    let query = this.leaveRepo.createQueryBuilder('lr')
      .leftJoinAndSelect('lr.employee', 'emp')
      .leftJoinAndSelect('lr.workflow', 'wf')
      .where('lr.status IN (:...statuses)', { statuses: [LeaveStatus.PENDING_RM, LeaveStatus.PENDING_HR] });

    if (user.role === UserRole.REPORTING_MANAGER) {
      // Get leaves from employees who report to this manager
      query = query.andWhere('emp.reportingManagerId = :managerId', { managerId: user.id })
                   .andWhere('wf.currentStage = :stage', { stage: 'PENDING_RM' });
    } else if (user.role === UserRole.HR_MANAGER) {
      // Get leaves that are pending HR approval
      query = query.andWhere('wf.currentStage = :stage', { stage: 'PENDING_HR' });
    }
    // ADMIN can see all pending approvals

    const pending = await query.orderBy('lr.appliedAt', 'DESC').getMany();
    return { success: true, data: pending };
  }

  async approve(user: Employee, id: string, dto: ApproveLeaveDto) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.employeeId === user.id) throw new ForbiddenException('Self-approval not allowed');

    const wf = await this.wfRepo.findOne({ where: { leaveRequestId: id } });
    if (!wf) throw new NotFoundException('Workflow not found');

    if (dto.approverType === ApproverType.REPORTING_MANAGER) {
      this.ensureApproverRole(user, ApproverType.REPORTING_MANAGER);
      if (wf.currentStage !== 'PENDING_RM') throw new BadRequestException('Not in RM stage');
      wf.reportingManagerApproval = true;
      wf.currentStage = 'PENDING_HR' as any;
      leave.status = LeaveStatus.PENDING_HR;
    } else if (dto.approverType === ApproverType.HR_MANAGER) {
      this.ensureApproverRole(user, ApproverType.HR_MANAGER);
      if (wf.currentStage !== 'PENDING_HR') throw new BadRequestException('Not in HR stage');

      // finalize with balance deduction in a transaction
      await this.dataSource.transaction(async (manager) => {
        const year = new Date(leave.startDate).getFullYear();
        const balRepo = manager.getRepository(LeaveBalance);
        const bal = await balRepo.findOne({ where: { employeeId: leave.employeeId, year, leaveType: leave.leaveType } });
        if (!bal || bal.remaining < leave.totalDays) throw new BadRequestException('Insufficient balance at approval time');
        bal.used += leave.totalDays;
        bal.remaining = bal.allocated + bal.carryForward - bal.used;
        await balRepo.save(bal);

        wf.hrManagerApproval = true;
        wf.currentStage = 'COMPLETED' as any;
        leave.status = LeaveStatus.APPROVED;
        await manager.getRepository(LeaveWorkflow).save(wf);
        await manager.getRepository(LeaveRequest).save(leave);
      });
    } else {
      throw new BadRequestException('Invalid approverType');
    }

    const approval = this.approvalRepo.create({
      leaveRequestId: id,
      approverId: user.id,
      approverType: dto.approverType,
      action: ApprovalAction.APPROVE,
      comments: dto.comments,
    });
    await this.approvalRepo.save(approval);

    await this.wfRepo.save(wf);
    await this.leaveRepo.save(leave);

    return { success: true, message: 'Approved', data: { leave } };
  }

  async reject(user: Employee, id: string, dto: ApproveLeaveDto) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.employeeId === user.id) throw new ForbiddenException('Self-approval not allowed');

    const wf = await this.wfRepo.findOne({ where: { leaveRequestId: id } });
    if (!wf) throw new NotFoundException('Workflow not found');

    const approval = this.approvalRepo.create({
      leaveRequestId: id,
      approverId: user.id,
      approverType: dto.approverType,
      action: ApprovalAction.REJECT,
      comments: dto.comments,
    });

    leave.status = LeaveStatus.REJECTED;
    wf.currentStage = 'COMPLETED' as any;

    await this.approvalRepo.save(approval);
    await this.wfRepo.save(wf);
    await this.leaveRepo.save(leave);

    return { success: true, message: 'Rejected', data: { leave } };
  }

  async history(user: Employee, id: string) {
    const leave = await this.leaveRepo.findOne({ 
      where: { id },
      relations: ['employee']
    });
    if (!leave) throw new NotFoundException('Leave not found');
    
    // Get approvals with approver details
    const approvals = await this.approvalRepo.find({ 
      where: { leaveRequestId: id }, 
      relations: ['approver'],
      order: { timestamp: 'ASC' } 
    });

    // Create approval history array starting with "Applied" entry
    const history = [];
    
    // Add "Applied" entry
    history.push({
      id: `applied-${leave.id}`,
      approver: leave.employee.name,
      approverType: 'EMPLOYEE',
      action: 'APPLIED',
      comments: 'Leave request submitted',
      timestamp: leave.appliedAt,
    });

    // Add actual approvals
    approvals.forEach(approval => {
      history.push({
        id: approval.id,
        approver: approval.approver?.name || 'Unknown',
        approverType: approval.approverType,
        action: approval.action,
        comments: approval.comments,
        timestamp: approval.timestamp,
      });
    });

    return { success: true, data: { leaveRequest: leave, approvals: history } };
  }
}
