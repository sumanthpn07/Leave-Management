import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedEmployees } from './seeds/employee.seed';
import { seedLeaveBalances } from './seeds/leave-balance.seed';
import { seedLeaveRequests } from './seeds/leave-request.seed';

// Load environment variables
config();

async function clearAndSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');
    console.log('Clearing existing data...');

    // Clear data from tables in reverse order of dependency
    await dataSource.query('DELETE FROM leave_approvals');
    await dataSource.query('DELETE FROM leave_workflows');
    await dataSource.query('DELETE FROM leave_requests');
    await dataSource.query('DELETE FROM leave_balances');
    await dataSource.query('DELETE FROM employees');
    console.log('Existing data cleared');

    await seedEmployees(dataSource);
    await seedLeaveBalances(dataSource);
    await seedLeaveRequests(dataSource);
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

clearAndSeed();
