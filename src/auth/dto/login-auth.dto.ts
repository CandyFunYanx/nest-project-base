import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ example: 'ayanx' })
  username: string;

  @ApiProperty({ example: '123456' })
  password: string;
}
