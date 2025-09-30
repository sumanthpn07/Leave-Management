import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { LeaveRequest } from '../../leaves/entities/leave-request.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { ApproverType } from '../../common/enums/approver-type.enum';
import { ApprovalAction } from '../../common/enums/approval-action.enum';

@Entity('leave_approvals')
export class LeaveApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  leaveRequestId: string;

  @ManyToOne(() => LeaveRequest, (lr) => lr.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leaveRequestId' })
  leaveRequest: LeaveRequest;

  @Index()
  @Column('uuid')
  approverId: string;

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'approverId' })
  approver: Employee;

  @Column({ type: 'enum', enum: ApproverType })
  approverType: ApproverType;

  @Column({ type: 'enum', enum: ApprovalAction })
  action: ApprovalAction;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn()
  timestamp: Date;
}
