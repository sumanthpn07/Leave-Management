import { DataSource } from 'typeorm';
import { LeaveRequest } from '../../leaves/entities/leave-request.entity';
import { LeaveWorkflow } from '../../workflows/entities/leave-workflow.entity';
import { LeaveBalance } from '../../leaves/entities/leave-balance.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from '../../common/enums/leave-type.enum';
import { LeaveStatus } from '../../common/enums/leave-status.enum';
import { WorkflowStage } from '../../common/enums/workflow-stage.enum';

export async function seedLeaveRequests(dataSource: DataSource) {
  const leaveRepo = dataSource.getRepository(LeaveRequest);
  const workflowRepo = dataSource.getRepository(LeaveWorkflow);
  const balanceRepo = dataSource.getRepository(LeaveBalance);
  const empRepo = dataSource.getRepository(Employee);

  const employees = await empRepo.find({ where: { isActive: true } });
  const currentYear = new Date().getFullYear(); // 2025

  // Create some sample leave requests for 2025
  const leaveRequests = [
    {
      employeeId: employees.find(e => e.employeeCode === 'EMP001')?.id, // Priya Sharma
      leaveType: LeaveType.ANNUAL,
      startDate: new Date(`${currentYear}-03-15`),
      endDate: new Date(`${currentYear}-03-17`),
      totalDays: 3,
      reason: 'Family wedding in Delhi',
      status: LeaveStatus.APPROVED,
      appliedAt: new Date(`${currentYear}-02-20`),
    },
    {
      employeeId: employees.find(e => e.employeeCode === 'EMP001')?.id, // Priya Sharma
      leaveType: LeaveType.SICK,
      startDate: new Date(`${currentYear}-05-10`),
      endDate: new Date(`${currentYear}-05-10`),
      totalDays: 1,
      reason: 'Fever and medical consultation',
      status: LeaveStatus.APPROVED,
      appliedAt: new Date(`${currentYear}-05-08`),
    },
    {
      employeeId: employees.find(e => e.employeeCode === 'EMP004')?.id, // Vikram Singh
      leaveType: LeaveType.PERSONAL,
      startDate: new Date(`${currentYear}-06-20`),
      endDate: new Date(`${currentYear}-06-22`),
      totalDays: 3,
      reason: 'Personal work and family time',
      status: LeaveStatus.PENDING_RM,
      appliedAt: new Date(`${currentYear}-06-15`),
    },
    {
      employeeId: employees.find(e => e.employeeCode === 'EMP007')?.id, // Arjun Verma
      leaveType: LeaveType.ANNUAL,
      startDate: new Date(`${currentYear}-07-10`),
      endDate: new Date(`${currentYear}-07-15`),
      totalDays: 6,
      reason: 'Summer vacation with family',
      status: LeaveStatus.PENDING_HR,
      appliedAt: new Date(`${currentYear}-06-25`),
    },
    {
      employeeId: employees.find(e => e.employeeCode === 'EMP005')?.id, // Suresh Gupta
      leaveType: LeaveType.SICK,
      startDate: new Date(`${currentYear}-08-05`),
      endDate: new Date(`${currentYear}-08-07`),
      totalDays: 3,
      reason: 'Medical treatment and recovery',
      status: LeaveStatus.APPROVED,
      appliedAt: new Date(`${currentYear}-08-01`),
    },
    {
      employeeId: employees.find(e => e.employeeCode === 'EMP006')?.id, // Meera Reddy
      leaveType: LeaveType.PERSONAL,
      startDate: new Date(`${currentYear}-09-15`),
      endDate: new Date(`${currentYear}-09-16`),
      totalDays: 2,
      reason: 'Personal commitments',
      status: LeaveStatus.REJECTED,
      appliedAt: new Date(`${currentYear}-09-10`),
    },
    {
      employeeId: employees.find(e => e.employeeCode === 'EMP008')?.id, // Kavya Nair
      leaveType: LeaveType.ANNUAL,
      startDate: new Date(`${currentYear}-10-20`),
      endDate: new Date(`${currentYear}-10-25`),
      totalDays: 6,
      reason: 'Diwali festival with family',
      status: LeaveStatus.PENDING_RM,
      appliedAt: new Date(`${currentYear}-10-15`),
    },
    {
      employeeId: employees.find(e => e.employeeCode === 'EMP010')?.id, // Deepika Joshi
      leaveType: LeaveType.SICK,
      startDate: new Date(`${currentYear}-11-12`),
      endDate: new Date(`${currentYear}-11-12`),
      totalDays: 1,
      reason: 'Doctor appointment',
      status: LeaveStatus.APPROVED,
      appliedAt: new Date(`${currentYear}-11-10`),
    },
  ];

  for (const leaveData of leaveRequests) {
    if (!leaveData.employeeId) continue;

    const leave = leaveRepo.create(leaveData);
    const savedLeave = await leaveRepo.save(leave);

    // Create corresponding workflow
    const workflow = workflowRepo.create({
      leaveRequestId: savedLeave.id,
      currentStage: leaveData.status === LeaveStatus.PENDING_RM ? WorkflowStage.PENDING_RM :
                   leaveData.status === LeaveStatus.PENDING_HR ? WorkflowStage.PENDING_HR :
                   WorkflowStage.COMPLETED, // For approved/rejected leaves
    });
    await workflowRepo.save(workflow);

    // If the leave is approved, update the leave balance
    if (leaveData.status === LeaveStatus.APPROVED) {
      const balance = await balanceRepo.findOne({
        where: {
          employeeId: leaveData.employeeId,
          leaveType: leaveData.leaveType,
          year: currentYear,
        },
      });

      if (balance) {
        // Update the balance
        balance.used = (balance.used || 0) + leaveData.totalDays;
        balance.remaining = balance.allocated - balance.used;
        await balanceRepo.save(balance);
        
        console.log(`Updated leave balance for ${leaveData.leaveType}: Used ${balance.used}/${balance.allocated}, Remaining: ${balance.remaining}`);
      }
    }
  }

  console.log(`Created ${leaveRequests.length} leave requests for ${currentYear}`);
}
