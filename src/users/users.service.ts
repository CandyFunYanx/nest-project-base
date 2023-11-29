import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@libs/db/models/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    // 先查找用户表中是否已经存在同样的username或者email的用户
    const user = await this.userModel.findOne({
      username,
    });
    if (user) {
      throw new HttpException(
        '当前用户名已被使用，请检查您的填写',
        HttpStatus.BAD_REQUEST,
      );
      return;
    }
    return await this.userModel.create({
      username,
      password,
    });
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
