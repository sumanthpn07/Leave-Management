import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { LeaveStatus } from '../common/enums/leave-status.enum';
import { LeaveType } from '../common/enums/leave-type.enum';
import { LeaveWorkflow } from '../workflows/entities/leave-workflow.entity';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(LeaveRequest) private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance) private balanceRepo: Repository<LeaveBalance>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(LeaveWorkflow) private wfRepo: Repository<LeaveWorkflow>,
    private dataSource: DataSource,
  ) {}

  private diffDays(start: Date, end: Date) {
    const ms = Math.abs(end.getTime() - start.getTime());
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  }

  private assertBusinessRules(employee: Employee, dto: CreateLeaveDto, totalDays: number) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const today = new Date();
    const isWeekendOnly = start.getDay() === 6 && end.getDay() === 0 && totalDays <= 2;
    if (start > end) throw new BadRequestException('startDate must be <= endDate');
    if (start < new Date(today.toDateString())) throw new BadRequestException('Cannot apply for past dates');
    if (isWeekendOnly) throw new BadRequestException('Weekend-only leave not allowed');
    if (dto.leaveType === LeaveType.ANNUAL) {
      const noticeMs = start.getTime() - today.getTime();
      if (noticeMs < 24 * 3600 * 1000) throw new BadRequestException('Minimum 1 day advance notice required for casual/annual leave');
    }
    // Fixed: Check if documents are provided (either from file upload or existing)
    if (dto.leaveType === LeaveType.SICK && totalDays > 3 && !dto.documents) {
      throw new BadRequestException('Medical certificate required for sick leave > 3 days');
    }
  }

  async apply(employeeId: string, dto: CreateLeaveDto) {
    const employee = await this.empRepo.findOne({ where: { id: employeeId, isActive: true } });
    if (!employee) throw new ForbiddenException('Invalid user');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const totalDays = this.diffDays(start, end);

    this.assertBusinessRules(employee, dto, totalDays);

    // Check for overlapping leaves
    const overlapping = await this.leaveRepo
      .createQueryBuilder('lr')
      .where('lr.employeeId = :employeeId', { employeeId })
      .andWhere('lr.status IN (:...statuses)', { statuses: [LeaveStatus.PENDING_RM, LeaveStatus.PENDING_HR, LeaveStatus.APPROVED] })
      .andWhere('(lr.startDate <= :end AND lr.endDate >= :start)', { start, end })
      .getOne();

    if (overlapping) throw new BadRequestException('Overlapping leave exists');

    const leave = this.leaveRepo.create({
      employeeId,
      leaveType: dto.leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: dto.reason,
      documents: dto.documents,
      status: LeaveStatus.PENDING_RM,
      appliedAt: new Date(),
    });

    const saved = await this.leaveRepo.save(leave);

    // Create workflow
    const workflow = this.wfRepo.create({
      leaveRequestId: saved.id,
      currentStage: 'PENDING_RM' as any,
    });
    await this.wfRepo.save(workflow);

    return { success: true, message: 'Leave applied', data: saved };
  }

  async listMy(employeeId: string, query: any) {
    const leaves = await this.leaveRepo.find({
      where: { employeeId },
      order: { appliedAt: 'DESC' },
    });
    return { success: true, data: leaves };
  }

  async getOne(employeeId: string, id: string) {
    const leave = await this.leaveRepo.findOne({ where: { id, employeeId } });
    if (!leave) throw new NotFoundException('Leave not found');
    return { success: true, data: leave };
  }

  async update(employeeId: string, id: string, dto: UpdateLeaveDto) {
    const leave = await this.leaveRepo.findOne({ where: { id, employeeId } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (![LeaveStatus.PENDING_RM].includes(leave.status)) throw new BadRequestException('Only pending RM leaves can be updated');

    const next = { ...leave } as any;
    if (dto.startDate) next.startDate = new Date(dto.startDate);
    if (dto.endDate) next.endDate = new Date(dto.endDate);
    if (dto.leaveType) next.leaveType = dto.leaveType;
    if (dto.reason !== undefined) next.reason = dto.reason;
    // Fixed: Only update documents if it's actually provided (not undefined)
    if (dto.documents !== undefined && dto.documents !== null) {
      next.documents = dto.documents;
    }

    next.totalDays = this.diffDays(new Date(next.startDate), new Date(next.endDate));
    this.assertBusinessRules(await this.empRepo.findOne({ where: { id: employeeId } }), next, next.totalDays);

    await this.leaveRepo.update({ id }, next);
    const updated = await this.leaveRepo.findOne({ where: { id } });
    return { success: true, message: 'Leave updated', data: updated };
  }

  async cancel(employeeId: string, id: string) {
    const leave = await this.leaveRepo.findOne({ where: { id, employeeId } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (![LeaveStatus.PENDING_RM, LeaveStatus.PENDING_HR].includes(leave.status)) throw new BadRequestException('Only pending leaves can be cancelled');
    await this.leaveRepo.update({ id }, { status: LeaveStatus.CANCELLED });
    return { success: true, message: 'Leave cancelled' };
  }

  async getBalances(employeeId: string) {
    const year = new Date().getFullYear();
    const balances = await this.balanceRepo.find({ where: { employeeId, year } });
    return { success: true, data: balances };
  }
}
