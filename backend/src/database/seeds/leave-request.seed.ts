import { DataSource } from 'typeorm';
import { LeaveRequest } from '../../leaves/entities/leave-request.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from '../../common/enums/leave-type.enum';
import { LeaveStatus } from '../../common/enums/leave-status.enum';
import { LeaveWorkflow } from '../../workflows/entities/leave-workflow.entity';

export async function seedSampleLeaves(dataSource: DataSource) {
  const leaveRepo = dataSource.getRepository(LeaveRequest);
  const empRepo = dataSource.getRepository(Employee);
  const wfRepo = dataSource.getRepository(LeaveWorkflow);

  const rohit = await empRepo.findOne({ where: { name: 'John Doe' } });
  if (!rohit) return;

  const exists = await leaveRepo.findOne({ where: { employeeId: rohit.id } });
  if (exists) return;

  const samples = [
    {
      reason: "Sister's wedding in Jaipur",
      leaveType: LeaveType.ANNUAL,
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-17'),
    },
    {
      reason: 'Fever and medical consultation',
      leaveType: LeaveType.SICK,
      startDate: new Date('2024-12-20'),
      endDate: new Date('2024-12-20'),
    },
  ];

  for (const s of samples) {
    const totalDays = Math.floor((s.endDate.getTime() - s.startDate.getTime()) / (1000*60*60*24)) + 1;
    const lr = leaveRepo.create({
      employeeId: rohit.id,
      leaveType: s.leaveType,
      startDate: s.startDate,
      endDate: s.endDate,
      totalDays,
      reason: s.reason,
      status: LeaveStatus.PENDING_RM,
    });
    const saved = await leaveRepo.save(lr);
    await wfRepo.save(wfRepo.create({ leaveRequestId: saved.id }));
  }
}
