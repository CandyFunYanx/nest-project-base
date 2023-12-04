import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RoleDocument = HydratedDocument<Role>;

@Schema({
  timestamps: true,
})
export class Role {
  @ApiProperty({ description: '身份标签' })
  @Prop()
  id: number;

  @ApiProperty({ description: '身份名称' })
  @Prop()
  name: string;
}

/**
 * 与别的模型关联
 * @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
 * cat: Category[]
 */

export const RoleSchema = SchemaFactory.createForClass(Role);
