import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsDateString, IsOptional, MinLength } from 'class-validator';
import { LeaveType } from '../../common/enums/leave-type.enum';

export class UpdateLeaveDto {
  @ApiProperty({
    description: 'Type of leave',
    enum: LeaveType,
    example: LeaveType.ANNUAL,
    required: false
  })
  @IsOptional()
  @IsEnum(LeaveType, { message: 'Invalid leave type' })
  leaveType?: LeaveType;

  @ApiProperty({
    description: 'Start date of leave (ISO format)',
    example: '2024-12-15',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @ApiProperty({
    description: 'End date of leave (ISO format)',
    example: '2024-12-17',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @ApiProperty({
    description: 'Reason for leave',
    example: 'Family vacation',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MinLength(10, { message: 'Reason must be at least 10 characters long' })
  reason?: string;

  @ApiProperty({
    description: 'Optional document URL',
    example: '/uploads/medical_certificate.pdf',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Documents must be a string' })
  documents?: string;
}
