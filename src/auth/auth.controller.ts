import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@libs/db/models/user.model';
import { Model } from 'mongoose';
import { Roles } from 'src/decoration/roles.decoration';
import { RoleGuard } from 'src/guard/roles.guard';

@ApiTags('Auth校验')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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

  @Get('refresh/:refresh_token')
  @ApiOperation({ summary: 'Token刷新' })
  async refresh(@Param('refresh_token') refresh_token: string) {
    try {
      const data = this.jwtService.verify(refresh_token);
      const user = await this.userModel.findById(data.id);
      const new_access_token = this.jwtService.sign(
        {
          id: String(user._id),
        },
        {
          expiresIn: '1h',
        },
      );
      const new_refresh_token = this.jwtService.sign(
        {
          id: String(user._id),
        },
        {
          expiresIn: '7d',
        },
      );
      return {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      };
    } catch (e) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
