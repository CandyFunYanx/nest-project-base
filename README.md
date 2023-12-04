# Nest Project Base Demo

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
再创建`config/base.ts`读取配置

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

## 用户登录校验并返回token
```bash
yarn add @nestjs/jwt
```


```ts
const { username, password } = req.body;
const user = this.userModel.find({ username: username }).select('+password');
if (!user) { throw new HttpException('当前用户不存在请检查后重试') }
const isValid = bcrypt.compareSync(password, user.password);
if (!isValid) { throw new HttpException('当前用户名或密码错误，请检查后重试') }
const access_token = this.jwtService.sign(
  { id: user._id },
  { expiresIn: '1h' },
)
const refresh_token = this.jwtService.sign(
  { id: user._id },
  { expiresIn: '1h' },
)
return {
  access_token,
  refresh_token
}
```

## 登陆验证通过@nestjs/passport passport-local实现
```bash
yarn add @nestjs/passport passport-local @types/passport-local
```

`local.strategy.ts`
```ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { Strategy, IStrategyOptions } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@libs/db/models/user.model';
import * as bcrypt from 'bcryptjs';

export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    } as IStrategyOptions);
  }

  async validate(username: string, password: string) {
    // 判断是否存在用户
    const user = await this.userModel.findOne({ username }).select('+password');
    if (!user) {
      throw new HttpException('您输入的用户不存在', HttpStatus.BAD_REQUEST);
    }
    // 判断密码是否正确
    const passValid = bcrypt.compareSync(password, user.password);
    if (!passValid) {
      throw new HttpException(
        '账号或密码错误，请检查后重试',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }
}
```
`auth.controller.ts`
```ts
import { UseGuards } from '@nestjs/common';
import { LocalStrategy } from './strategy/local.strategy.ts';
import { AuthGurad } from '@nestjs/passport';

@UseGuards(AuthGuard('local'))
@Post('login')
async login(@Body() body, @Req req) {}
```

## 使用passport-jwt校验登录状态

```bash
yarn add passport-jwt @types/passport-jwt
```

```ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { Strategy, StrategyOptions, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@libs/db/models/user.model';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || configService.get('JWT_SECRET'),
    } as StrategyOptions);
  }

  async validate(info) {
    const user = await this.userModel.findById(info.id);
    if (!user) {
      throw new HttpException('没有授权，请登录', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}

```

## 接口设置用户身份验证
创建role.enum.ts文件
```ts
export enum Role {
  USER = 1,
  ADMIN = 2,
}
```
给接口设置相应的权限，并且需要在拦截的时候能取到
我们写一个装饰器，不然就只能往请求头或请求体上添加了
创建role.decorator.ts
```ts
import { setMetadata } from '@nestjs/common';
import { Role } from 'src/enum/role.enum.ts';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```
以上步骤完成之后我们就需要写守卫了，来判断请求接口的账号有没有相对应的权限
创建role.guard.ts
```ts
import { Canactivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service.ts';
import { Role } from 'src/enum/role.enum.ts';
import { ROLES_KEY } from 'src/decoration/roles.decoration.ts';

export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Boolean {
    // 1.通过反射获取到装饰器的权限
    // getAllAndOverride读取路由上的metadata getAllAndMerge合并路由上的metadata
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2.获取req拿到鉴权后的用户数据
    const req = context.switchToHttp().getRequest();

    // 3.通过用户数据从数据查询权限
    const user = await this.usersService.findOne(req.user._id);
    const roleIds = user.roles.map((item) => item.id);

    // 4.判断用户权限是否为装饰器的权限 的some返回boolean
    const flag = requireRoles.some((role) => roleIds.includes(role));

    return flag;
  }
}
```
然后将这些按照我们刚才思路的步骤添加到我们的应用程序中
`auth.controller.ts`
```ts
@Post('')
@Roles(1, 2)
@UseGuards(AuthGuard('jwt'), RoleGuard)
```