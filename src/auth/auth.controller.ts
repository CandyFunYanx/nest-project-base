import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Auth校验')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '登录' })
  @UseGuards(AuthGuard('local'))
  async login(@Body() loginAuthDto: LoginAuthDto, @Req() req) {
    const user = req.user;
    const token = this.jwtService.sign(
      {
        id: String(user._id),
      },
      {
        expiresIn: '0.01h',
      },
    );
    const ftoken = this.jwtService.sign(
      {
        id: String(user._id),
      },
      {
        expiresIn: '7d',
      },
    );
    return {
      access_token: token,
      refresh_token: ftoken,
      msg: '登录成功',
    };
  }

  @Get('user')
  @ApiOperation({ summary: '用户信息' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async user(@Req() req) {
    return req.user;
  }
}
