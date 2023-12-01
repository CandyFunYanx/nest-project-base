import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TransformInterceptor } from './interceptor/transform/transform.interceptor';
import { HttpExceptionFilter } from './filter/http_exception/http_exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 开启跨域
  app.enableCors();

  // 开启静态资源托管
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });

  // 使用拦截器 响应数据统一
  app.useGlobalInterceptors(new TransformInterceptor());

  // 使用错误处理
  app.useGlobalFilters(new HttpExceptionFilter());

  const option = new DocumentBuilder()
    .setTitle('Nest Project Base Api Docs')
    .setDescription('一个nest项目基础框架的api文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, option);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(3010);
}
bootstrap();
