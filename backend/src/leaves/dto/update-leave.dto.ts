import { ApiProperty } from '@nestjs/swagger';
import { LeaveType } from '../../common/enums/leave-type.enum';

export class UpdateLeaveDto {
  @ApiProperty({
    description: 'Type of leave',
    enum: LeaveType,
    example: LeaveType.ANNUAL,
    required: false
  })
  leaveType?: LeaveType;

  @ApiProperty({
    description: 'Start date of leave (ISO format)',
    example: '2024-12-15',
    required: false
  })
  startDate?: string;

  @ApiProperty({
    description: 'End date of leave (ISO format)',
    example: '2024-12-17',
    required: false
  })
  endDate?: string;

  @ApiProperty({
    description: 'Reason for leave',
    example: 'Family vacation',
    required: false
  })
  reason?: string;

  @ApiProperty({
    description: 'Optional document URL',
    example: '/uploads/medical_certificate.pdf',
    required: false
  })
  documents?: string;
}
