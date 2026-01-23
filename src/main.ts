import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Secure File Upload API')
    .setDescription(
      'A secure file upload system with JWT authentication, CSRF protection, and comprehensive file validation. ' +
        'This API allows authenticated users to securely upload, manage, and download files with built-in security features.',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Files', 'File upload, download, and management endpoints')
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
    .addCookieAuth(
      'csrf-token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'csrf-token',
        description: 'CSRF token for state-changing operations',
      },
      'CSRF-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    }
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('Swagger Documentation: http://localhost:3000/api-docs');
}
bootstrap();
