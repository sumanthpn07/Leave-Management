import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from '../../common/enums/leave-type.enum';
import { LeaveStatus } from '../../common/enums/leave-status.enum';
import { LeaveApproval } from '../../approvals/entities/leave-approval.entity';
import { LeaveWorkflow } from '../../workflows/entities/leave-workflow.entity';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  employeeId: string;

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  totalDays: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING_RM })
  status: LeaveStatus;

  @CreateDateColumn()
  appliedAt: Date;

  @Column({ type: 'text', nullable: true })
  documents?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LeaveApproval, (a) => a.leaveRequest, { cascade: false })
  approvals: LeaveApproval[];

  @OneToOne(() => LeaveWorkflow, (wf) => wf.leaveRequest, { cascade: true })
  workflow: LeaveWorkflow;
}
