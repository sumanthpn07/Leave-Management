require('dotenv').config();
const { ConfigService } = require('@nestjs/config');

console.log('Direct env access:', process.env.JWT_SECRET);

// Test with ConfigService
const configService = new ConfigService();
console.log('ConfigService access:', configService.get('JWT_SECRET'));
