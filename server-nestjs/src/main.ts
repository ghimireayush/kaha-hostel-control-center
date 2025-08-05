import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS for frontend integration
  app.enableCors({
    origin: [
      '*',
      '*.netlify.app',
      'http://*.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true,
  });

  // Set global prefix and versioning
  app.setGlobalPrefix('hostel/api');
  app.enableVersioning({ 
    type: VersioningType.URI, 
    defaultVersion: '1' 
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Kaha Hostel Management API')
    .setDescription('Comprehensive API for managing hostel operations')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('students', 'Student management operations')
    .addTag('rooms', 'Room management operations')
    .addTag('invoices', 'Invoice management operations')
    .addTag('payments', 'Payment management operations')
    .addTag('ledger', 'Ledger management operations')
    .addTag('bookings', 'Booking request operations')
    .addTag('discounts', 'Discount management operations')
    .addTag('reports', 'Report generation operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('hostel/api/v1/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, () => {
    console.log(`🚀 Kaha Hostel NestJS API is running on: http://localhost:${port}`);
    console.log(`� AP I Documentation available at: http://localhost:${port}/hostel/api/v1/docs`);
  });
}

bootstrap();