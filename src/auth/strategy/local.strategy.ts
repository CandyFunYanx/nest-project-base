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
