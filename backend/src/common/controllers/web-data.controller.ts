import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Web')
@Controller()
export class WebDataController {
  @Get('user-profile')
  @ApiOperation({ summary: 'Public user profile placeholder for web' })
  @ApiResponse({ status: 200 })
  getUserProfile(@Query('pref_lang') prefLang?: string) {
    return {
      id: 'guest',
      role: 'guest',
      preferredLanguage: prefLang || 'ru',
      features: {
        showBotData: true,
        showTests: true,
      },
    };
  }

  @Get('dr-tests-history')
  @ApiOperation({ summary: 'Public tests history placeholder for web' })
  @ApiResponse({ status: 200 })
  getDrTestsHistory(@Query('pref_lang') prefLang?: string) {
    return {
      items: [],
      total: 0,
      language: prefLang || 'ru',
    };
  }
}
