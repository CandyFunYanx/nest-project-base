import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @ApiProperty({ description: '用户名' })
  @Prop()
  username: string;

  @ApiProperty({ description: '密码' })
  @Prop({
    set(val) {
      return bcrypt.hashSync(val);
    },
    select: false,
  })
  password: string;
}

/**
 * 与别的模型关联
 * @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
 * cat: Category[]
 */

export const UserSchema = SchemaFactory.createForClass(User);
