import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Employee } from './employees/entities/employee.entity';
import { LeaveRequest } from './leaves/entities/leave-request.entity';
import { LeaveBalance } from './leaves/entities/leave-balance.entity';
import { LeaveWorkflow } from './workflows/entities/leave-workflow.entity';
import { LeaveApproval } from './approvals/entities/leave-approval.entity';
import { LeavesModule } from './leaves/leaves.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [Employee, LeaveRequest, LeaveBalance, LeaveWorkflow, LeaveApproval],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    LeavesModule,
    ApprovalsModule,
    AdminModule,
  ],
})
export class AppModule {}
