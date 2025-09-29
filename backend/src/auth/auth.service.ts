import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Employee } from '../employees/entities/employee.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    // Find user by email
    const user = await this.employeeRepository.findOne({
      where: { email, isActive: true },
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate JWT token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      employeeCode: user.employeeCode 
    };
    
    const token = this.jwtService.sign(payload);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    };
  }

  async validateUser(userId: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { id: userId, isActive: true },
    });
  }
}
