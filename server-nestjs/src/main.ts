import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.setGlobalPrefix("hostel/api");
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const config = new DocumentBuilder()
    .setTitle("KAHA-HOSTEL")
    .setDescription("KAHA")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("hostel/api/v1/docs", app, document);

  await app.listen(process.env.PORT, () => {
    console.log(`Hostel Server: http://localhost:${process.env.PORT}`);
    console.log(`Docs: http://localhost:${process.env.PORT}/hostel/api/v1/docs`);
  });
}

bootstrap();