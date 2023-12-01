import { ApiProperty } from '@nestjs/swagger';

export class RefreshAuthDto {
  @ApiProperty()
  refresh_token: string;
}
