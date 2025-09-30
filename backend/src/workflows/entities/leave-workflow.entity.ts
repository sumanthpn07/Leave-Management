import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { LeaveRequest } from '../../leaves/entities/leave-request.entity';
import { WorkflowStage } from '../../common/enums/workflow-stage.enum';

@Entity('leave_workflows')
export class LeaveWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column('uuid')
  leaveRequestId: string;

  @OneToOne(() => LeaveRequest, (lr) => lr.workflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leaveRequestId' })
  leaveRequest: LeaveRequest;

  @Column({ type: 'boolean', default: false })
  reportingManagerApproval: boolean;

  @Column({ type: 'boolean', default: false })
  hrManagerApproval: boolean;

  @Column({ type: 'enum', enum: WorkflowStage, default: WorkflowStage.PENDING_RM })
  currentStage: WorkflowStage;
}
