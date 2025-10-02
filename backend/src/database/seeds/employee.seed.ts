import { DataSource } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

export async function seedEmployees(dataSource: DataSource) {
  const employeeRepository = dataSource.getRepository(Employee);

  // Clear existing employees - this is already done in clear-and-seed.ts
  // await employeeRepository.delete({});

  const employeesData = [
    {
      employeeCode: 'EMP001',
      name: 'Priya Sharma',
      email: 'priya.sharma@company.com',
      department: 'Engineering',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2023-01-15'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP002',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      department: 'Engineering',
      role: UserRole.REPORTING_MANAGER,
      joinDate: new Date('2022-06-01'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP003',
      name: 'Anita Patel',
      email: 'anita.patel@company.com',
      department: 'HR',
      role: UserRole.HR_MANAGER,
      joinDate: new Date('2021-03-10'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP004',
      name: 'Vikram Singh',
      email: 'vikram.singh@company.com',
      department: 'Marketing',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2023-08-20'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP005',
      name: 'Suresh Gupta',
      email: 'suresh.gupta@company.com',
      department: 'IT',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2023-11-01'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP006',
      name: 'Meera Reddy',
      email: 'meera.reddy@company.com',
      department: 'Finance',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2024-02-15'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP007',
      name: 'Arjun Verma',
      email: 'arjun.verma@company.com',
      department: 'Engineering',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2023-09-10'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP008',
      name: 'Kavya Nair',
      email: 'kavya.nair@company.com',
      department: 'HR',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2024-01-05'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP009',
      name: 'Rohit Agarwal',
      email: 'rohit.agarwal@company.com',
      department: 'Marketing',
      role: UserRole.REPORTING_MANAGER,
      joinDate: new Date('2022-04-12'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'EMP010',
      name: 'Deepika Joshi',
      email: 'deepika.joshi@company.com',
      department: 'IT',
      role: UserRole.EMPLOYEE,
      joinDate: new Date('2023-12-01'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
    },
    {
      employeeCode: 'ADMIN001',
      name: 'Amit Kumar',
      email: 'admin@company.com',
      department: 'Administration',
      role: UserRole.ADMIN,
      joinDate: new Date('2020-01-01'),
      isActive: true,
      password: await bcrypt.hash('password123', 10),
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

  // Now update reporting manager relationships
  const priya = createdEmployees.find(emp => emp.employeeCode === 'EMP001');
  const rajesh = createdEmployees.find(emp => emp.employeeCode === 'EMP002');
  const anita = createdEmployees.find(emp => emp.employeeCode === 'EMP003');
  const vikram = createdEmployees.find(emp => emp.employeeCode === 'EMP004');
  const suresh = createdEmployees.find(emp => emp.employeeCode === 'EMP005');
  const arjun = createdEmployees.find(emp => emp.employeeCode === 'EMP007');
  const kavya = createdEmployees.find(emp => emp.employeeCode === 'EMP008');
  const rohit = createdEmployees.find(emp => emp.employeeCode === 'EMP009');
  const deepika = createdEmployees.find(emp => emp.employeeCode === 'EMP010');
  
  if (priya && rajesh) {
    priya.reportingManagerId = rajesh.id;
    await employeeRepository.save(priya);
    console.log(`Updated ${priya.name} to report to ${rajesh.name}`);
  }

  if (arjun && rajesh) {
    arjun.reportingManagerId = rajesh.id;
    await employeeRepository.save(arjun);
    console.log(`Updated ${arjun.name} to report to ${rajesh.name}`);
  }

  if (vikram && rohit) {
    vikram.reportingManagerId = rohit.id;
    await employeeRepository.save(vikram);
    console.log(`Updated ${vikram.name} to report to ${rohit.name}`);
  }

  if (kavya && anita) {
    kavya.reportingManagerId = anita.id;
    await employeeRepository.save(kavya);
    console.log(`Updated ${kavya.name} to report to ${anita.name}`);
  }

  if (deepika && suresh) {
    deepika.reportingManagerId = suresh.id;
    await employeeRepository.save(deepika);
    console.log(`Updated ${deepika.name} to report to ${suresh.name}`);
  }

  console.log('All employees seeded successfully');
}
