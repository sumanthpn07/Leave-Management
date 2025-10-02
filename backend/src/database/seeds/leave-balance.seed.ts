import { DataSource } from 'typeorm';
import { LeaveBalance } from '../../leaves/entities/leave-balance.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from '../../common/enums/leave-type.enum';

export async function seedLeaveBalances(dataSource: DataSource) {
  const balRepo = dataSource.getRepository(LeaveBalance);
  const empRepo = dataSource.getRepository(Employee);

  const employees = await empRepo.find({ where: { isActive: true } });
  const currentYear = new Date().getFullYear(); // 2025

  for (const emp of employees) {
    const presets: { leaveType: LeaveType; allocated: number }[] = [
      { leaveType: LeaveType.ANNUAL, allocated: 12 },
      { leaveType: LeaveType.SICK, allocated: 10 },
      { leaveType: LeaveType.PERSONAL, allocated: 18 },
    ];

    for (const p of presets) {
      const exists = await balRepo.findOne({ where: { employeeId: emp.id, year: currentYear, leaveType: p.leaveType } });
      if (exists) continue;
      
      const row = balRepo.create({
        employeeId: emp.id,
        leaveType: p.leaveType,
        year: currentYear,
        allocated: p.allocated,
        used: 0,
        remaining: p.allocated,
        carryForward: 0,
      });
      await balRepo.save(row);
    }
  }

  console.log(`Leave balances created for ${currentYear} for ${employees.length} employees`);
}
