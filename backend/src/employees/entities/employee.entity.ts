import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

@Entity('employees')
export class Employee {
  @ApiProperty({ 
    description: 'Unique identifier for the employee',
    example: 'ba2f06ad-54ba-4b05-8296-33bba6fc98e9'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Unique employee code',
    example: 'EMP001'
  })
  @Column({ unique: true })
  employeeCode: string;

  @ApiProperty({ 
    description: 'Full name of the employee',
    example: 'John Doe'
  })
  @Column()
  name: string;

  @ApiProperty({ 
    description: 'Email address of the employee',
    example: 'john.doe@company.com'
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ 
    description: 'Department where the employee works',
    example: 'Engineering'
  })
  @Column()
  department: string;

  @ApiProperty({ 
    description: 'Role of the employee in the organization',
    enum: UserRole,
    example: UserRole.EMPLOYEE
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @ApiProperty({ 
    description: 'ID of the reporting manager',
    example: 'c3d4e5f6-78g9-4h0i-9j1k-2l3m4n5o6p7q',
    nullable: true
  })
  @Column({ nullable: true })
  reportingManagerId: string;

  @ApiProperty({ 
    description: 'Date when the employee joined the company',
    example: '2024-01-15'
  })
  @Column({ type: 'date' })
  joinDate: Date;

  @ApiProperty({ 
    description: 'Whether the employee is active',
    example: true
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ 
    description: 'Hashed password of the employee',
    example: '$2a$10$hashedpassword...'
  })
  @Column()
  password: string;

  @ApiProperty({ 
    description: 'Date when the employee record was created',
    example: '2024-01-15T10:30:00.000Z'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ 
    description: 'Date when the employee record was last updated',
    example: '2024-01-15T10:30:00.000Z'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Self-referencing relationship for reporting manager
  @ManyToOne(() => Employee, (employee) => employee.subordinates, { nullable: true })
  reportingManager: Employee;

  @OneToMany(() => Employee, (employee) => employee.reportingManager)
  subordinates: Employee[];
}
