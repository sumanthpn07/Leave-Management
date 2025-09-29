import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  // Sample users data
  private readonly users = [
    {
      id: 1,
      email: 'john.doe@company.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
      department: 'Engineering',
    },
    {
      id: 2,
      email: 'jane.smith@company.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'MANAGER',
      department: 'Engineering',
    },
    {
      id: 3,
      email: 'mike.wilson@company.com',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Wilson',
      role: 'ADMIN',
      department: 'HR',
    },
    {
      id: 4,
      email: 'sarah.jones@company.com',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Jones',
      role: 'EMPLOYEE',
      department: 'Marketing',
    },
  ];

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    // Find user by email
    const user = this.users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + user.id, // Mock token for now
      },
    };
  }
}
