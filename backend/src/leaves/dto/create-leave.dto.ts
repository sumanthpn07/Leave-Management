import { ApiProperty } from '@nestjs/swagger';
import { LeaveType } from '../../common/enums/leave-type.enum';

export class CreateLeaveDto {
  @ApiProperty({
    description: 'Type of leave',
    enum: LeaveType,
    example: LeaveType.ANNUAL
  })
  leaveType: LeaveType;

  @ApiProperty({
    description: 'Start date of leave (ISO format)',
    example: '2024-12-15'
  })
  startDate: string;

  @ApiProperty({
    description: 'End date of leave (ISO format)',
    example: '2024-12-17'
  })
  endDate: string;

  @ApiProperty({
    description: 'Reason for leave',
    example: 'Family vacation'
  })
  reason: string;

  @ApiProperty({
    description: 'Optional document URL (required for sick leave > 3 days)',
    example: '/uploads/medical_certificate.pdf',
    required: false
  })
  documents?: string;
}
