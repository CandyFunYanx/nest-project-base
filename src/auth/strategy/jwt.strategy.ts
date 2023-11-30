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

  async validate(id) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('没有授权，请登录', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
