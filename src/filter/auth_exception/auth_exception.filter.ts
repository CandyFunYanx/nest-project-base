import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private async refreshToken(r_token) {
    try {
      const info = this.jwtService.verify(r_token);
      const id = info.id;
      const user = await this.usersService.findOne(id);
      const newAccessToken = this.jwtService.sign(
        {
          id: String(user._id),
        },
        {
          expiresIn: '0.01h',
        },
      );
      return newAccessToken;
    } catch (e) {
      throw new HttpException('当前的refresh_token无效，请重新登陆', 1001);
    }
  }

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getRequest<Response>();

    if (exception.getStatus() === HttpStatus.UNAUTHORIZED) {
      const r_token = request.headers['x-refresh-token'];
      const newAccessToken = await this.refreshToken(r_token);
      response.setHeader('Authorization', `Bearer ${newAccessToken}`);
      response.end();
    } else {
      throw exception;
    }
  }
}
