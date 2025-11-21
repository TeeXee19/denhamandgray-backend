import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('D&G Backend')
    .setDescription('This contains the swagger documenation for the D&G Project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // app.useGlobalPipes(new ValidationPipe({
  //   transform: true
  // }));

  // await app.listen(8000);
  await app.listen(process.env.PORT || 12344);
}
bootstrap();
