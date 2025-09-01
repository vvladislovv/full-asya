import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  telegramId: string;
}

export class TelegramAuthDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  auth_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  hash?: string;
}

export class TelegramMiniAppDto {
  @ApiProperty()
  @IsString()
  initData: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  hash?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  userId: string;
} 