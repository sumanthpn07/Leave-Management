import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('HTTP');
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Request logging middleware
  app.use((req, res, next) => {
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const timestamp = new Date().toISOString();
    
    logger.log(`📥 ${method} ${url} - ${ip} - ${userAgent} - ${timestamp}`);
    
    // Log request body for POST/PUT/PATCH requests (except for sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      const body = { ...req.body };
      // Remove sensitive fields from logging
      if (body.password) {
        body.password = '[REDACTED]';
      }
      logger.log(`📦 Request Body: ${JSON.stringify(body, null, 2)}`);
    }
    
    // Log response when it finishes
    const originalSend = res.send;
    res.send = function(data) {
      const { statusCode } = res;
      const responseTime = Date.now() - req.startTime;
      
      if (statusCode >= 400) {
        logger.error(`📤 ${method} ${url} - ${statusCode} - ${responseTime}ms`);
      } else {
        logger.log(`📤 ${method} ${url} - ${statusCode} - ${responseTime}ms`);
      }
      
      return originalSend.call(this, data);
    };
    
    req.startTime = Date.now();
    next();
  });

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Leave Management System API')
    .setDescription('API documentation for Leave Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Employees', 'Employee management endpoints')
    .addTag('Leaves', 'Leave management endpoints')
    .addTag('Approvals', 'Leave approval endpoints')
    .addTag('Admin', 'Admin dashboard endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  console.log(`�� File uploads: http://localhost:${port}/uploads/`);
  console.log(`📝 Request logging enabled - all requests will be logged`);
}

bootstrap();
