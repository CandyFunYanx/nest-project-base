## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Swagger
```bash
# 添加api文档
yarn add @nestjs/swagger swagger-ui-express
```

在`main.ts`中使用
```ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const option = new DocumentBuilder()
  .setTitle()
  .setDescription()
  .setVersion()
  .build()
const document = SwaggerModule.createDocument(app, option);
SwaggerModule.setup('/api/docs', app, document);
```

对数据库模型进行描述
```ts
import { ApiProperty } from '@nestjs/swagger';

@ApiProperty({ description: '用户名', example: 'user1' })
@Prop()
username: string;
```

## 环境变量
```bash
# 使用环境变量
yarn add @nestjs/config
```

与`src`同级添加`.dev.env`和`.prod.env`
再常见`config/base.ts`读取配置
```ts
import * as fs from 'fs';
import * as path from 'path';
const isProd = process.env.NODE_ENV === 'production';

function parseEnv() {
  const devEnv = path.resolve('.dev.env');
  const prodEnv = path.resolve('.prod.env');

  if (!fs.existAsync(devEnv) && !fs.existAsync(prodEnv)) {
    throw new Error('缺少环境配置文件')
  }

  const filePath = isProd && fs.existAsync(prodEnv) ? prodEnv : devEnv;

  return {
    path: filePath
  }
}

export default parseEnv();
```

## 数据库Mongodb
```bash
# 使用环境变量
yarn add @nestjs/mongoose mongoose
```

初始化数据库连接
```ts
MongooseModule.forRoot('', {
  useNewUrlParser: true
})
```

创建模型
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;
export class User {}
export const UserSchema = SchemaFactory.createForClass(User);
```

使用
```ts
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@libs/db/models/user.model';

constructor(
  @InjectModel(User.name)
  private readonly userModel: Model<User>
) {}
```

## 静态文件托管
```ts
import { MulterModule } from '@nestjs/platform-express';

MulterModule.register('uploads', {
  dest: '/uploads'
})
```

```ts
import { UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@UseInterceptors(FileInterceptor)
@Post()
async upload(@UploadedFile('file') file) {}
```

## 请求响应统一（Interceptor）
```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        data,
        msg: '请求成功',
      })),
    );
  }
}
```

## 请求错误处理（Filter）
```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    const resContent = {
      code: -1,
      data: null,
      msg: status >= 500 ? 'Server Error' : 'Client Error',
    };

    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(resContent);
  }
}
```

## 用户密码加密
```bash
yarn add bcryptjs @types/bcryptjs
```

去`libs/db/src/models/user.model.ts`中
进行加密操作，并设置默认取用户数据的时候不取密码
```ts
@Prop({
  set(val) {
    return val ? bcrypt.hashSync(val) : val;
  },
  select: false,
})
```