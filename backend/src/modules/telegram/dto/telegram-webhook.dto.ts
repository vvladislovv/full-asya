import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class TelegramWebhookDto {
  @ApiProperty({ description: 'Update ID' })
  @IsNumber()
  update_id: number;

  @ApiProperty({ description: 'Message data', required: false })
  @IsOptional()
  @IsObject()
  message?: any;

  @ApiProperty({ description: 'Callback query data', required: false })
  @IsOptional()
  @IsObject()
  callback_query?: any;

  @ApiProperty({ description: 'Inline query data', required: false })
  @IsOptional()
  @IsObject()
  inline_query?: any;

  @ApiProperty({ description: 'Chosen inline result data', required: false })
  @IsOptional()
  @IsObject()
  chosen_inline_result?: any;

  @ApiProperty({ description: 'Channel post data', required: false })
  @IsOptional()
  @IsObject()
  channel_post?: any;

  @ApiProperty({ description: 'Edited channel post data', required: false })
  @IsOptional()
  @IsObject()
  edited_channel_post?: any;

  @ApiProperty({ description: 'Inline query result chosen data', required: false })
  @IsOptional()
  @IsObject()
  callback_query_result?: any;
}
