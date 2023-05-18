import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import morgan from 'morgan';
import { ConfigAppService, checkDatabaseConnection } from '@configs';
import { HttpExceptionFilter } from '@exceptions';
import { LoggingInterceptor, TransformInterceptor } from '@interceptors';

const DEFAULT_API_VERSION = '1';

async function bootstrap() {
  await checkDatabaseConnection();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const options = new DocumentBuilder()
    .setTitle('API docs')
    .setVersion(DEFAULT_API_VERSION)
    .addBearerAuth()
    .build();

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    defaultVersion: DEFAULT_API_VERSION,
    type: VersioningType.URI,
  });

  app.use(morgan('tiny'));
  const port = new ConfigAppService().get('appPort');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalInterceptors(new LoggingInterceptor());

  // app.useStaticAssets(join(__dirname, '.', 'public'));
  // app.setBaseViewsDir(join(__dirname, '.', 'views'));
  // app.setViewEngine('pub');

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}/v${DEFAULT_API_VERSION}`,
  );
}
bootstrap();
