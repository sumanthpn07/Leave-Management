import { ApiProperty } from '@nestjs/swagger';
import { ApproverType } from '../../common/enums/approver-type.enum';

export class ApproveLeaveDto {
  @ApiProperty({
    description: 'Action to take',
    enum: ['approve', 'reject'],
    example: 'approve'
  })
  action: 'approve' | 'reject';

  @ApiProperty({
    description: 'Type of approver',
    enum: ApproverType,
    example: ApproverType.REPORTING_MANAGER
  })
  approverType: ApproverType;

  @ApiProperty({
    description: 'Optional comments',
    example: 'Approved for family function',
    required: false
  })
  comments?: string;
}
