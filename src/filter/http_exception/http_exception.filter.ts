import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const eMsg = exception.message;

    const resContent = {
      code: -1,
      data: null,
      msg: eMsg + ' - ' + status,
    };

    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(resContent);
  }
}
