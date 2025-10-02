import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApproverType } from '../../common/enums/approver-type.enum';

export class ApproveLeaveDto {
  @ApiProperty({
    description: 'Action to take',
    enum: ['approve', 'reject'],
    example: 'approve'
  })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiProperty({
    description: 'Type of approver',
    enum: ApproverType,
    example: ApproverType.REPORTING_MANAGER
  })
  @IsEnum(ApproverType)
  approverType: ApproverType;

  @ApiProperty({
    description: 'Optional comments',
    example: 'Approved for family function',
    required: false
  })
  @IsOptional()
  @IsString()
  comments?: string;
}
