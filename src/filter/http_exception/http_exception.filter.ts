import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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
