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
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';

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
    const token = this.jwtService.sign(String(user._id));
    return {
      token,
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
