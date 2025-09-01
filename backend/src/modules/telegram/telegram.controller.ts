import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TelegramWebhookDto } from './dto/telegram-webhook.dto';
import { TelegramService } from './telegram.service';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Telegram webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() webhookData: TelegramWebhookDto) {
    this.logger.log(`Received Telegram webhook: ${JSON.stringify(webhookData)}`);
    
    try {
      await this.telegramService.processWebhook(webhookData);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      return { status: 'error', message: error.message };
    }
  }

  @Post('questionnaire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive questionnaire data from bot' })
  @ApiResponse({ status: 200, description: 'Questionnaire data received' })
  async receiveQuestionnaire(@Body() questionnaireData: any) {
    this.logger.log(`Received questionnaire data: ${JSON.stringify(questionnaireData)}`);
    
    try {
      await this.telegramService.saveQuestionnaireData(questionnaireData);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error saving questionnaire data: ${error.message}`, error.stack);
      return { status: 'error', message: error.message };
    }
  }

  @Post('questionnaire/result')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive questionnaire result from bot' })
  @ApiResponse({ status: 200, description: 'Questionnaire result received' })
  async receiveQuestionnaireResult(@Body() resultData: any) {
    this.logger.log(`Received questionnaire result: ${JSON.stringify(resultData)}`);
    
    try {
      await this.telegramService.saveQuestionnaireResult(resultData);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error saving questionnaire result: ${error.message}`, error.stack);
      return { status: 'error', message: error.message };
    }
  }
}
