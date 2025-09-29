import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee } from '../../employees/entities/employee.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export async function seedEmployees(dataSource: DataSource) {
  const employeeRepository = dataSource.getRepository(Employee);
  
  // Check if employees already exist
  const existingEmployees = await employeeRepository.count();
  if (existingEmployees > 0) {
    console.log('Employees already seeded');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create employees without relationships first
  const employeesData = [
    {
      employeeCode: 'EMP001',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2023-01-15'),
      isActive: true,
      password: hashedPassword,
    },
    {
      employeeCode: 'EMP002',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'Engineering',
      role: UserRole.REPORTING_MANAGER,
      joinDate: new Date('2022-06-01'),
      isActive: true,
      password: hashedPassword,
    },
    {
      employeeCode: 'EMP003',
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com',
      department: 'HR',
      role: UserRole.HR_MANAGER,
      joinDate: new Date('2021-03-10'),
      isActive: true,
      password: hashedPassword,
    },
    {
      employeeCode: 'EMP004',
      name: 'Sarah Jones',
      email: 'sarah.jones@company.com',
      department: 'Marketing',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2023-08-20'),
      isActive: true,
      password: hashedPassword,
    },
    {
      employeeCode: 'EMP005',
      name: 'Admin User',
      email: 'admin@company.com',
      department: 'IT',
      role: UserRole.ADMIN,
      joinDate: new Date('2020-01-01'),
      isActive: true,
      password: hashedPassword,
    },
  ];

  // Create all employees first
  const createdEmployees = [];
  for (const employeeData of employeesData) {
    const employee = employeeRepository.create(employeeData);
    const savedEmployee = await employeeRepository.save(employee);
    createdEmployees.push(savedEmployee);
    console.log(`Created employee: ${savedEmployee.name} (${savedEmployee.employeeCode})`);
  }

  // Now update Sarah Jones to have Jane Smith as her reporting manager
  const sarah = createdEmployees.find(emp => emp.employeeCode === 'EMP004');
  const jane = createdEmployees.find(emp => emp.employeeCode === 'EMP002');
  
  if (sarah && jane) {
    sarah.reportingManagerId = jane.id;
    await employeeRepository.save(sarah);
    console.log(`Updated ${sarah.name} to report to ${jane.name}`);
  }

  console.log('All employees seeded successfully');
}
