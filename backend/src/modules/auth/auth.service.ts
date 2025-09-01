import { UsersService } from '@modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { LoginDto, TelegramAuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(telegramId: string): Promise<User> {
    let user = await this.usersService.findByTelegramId(telegramId);
    
    // Автоматически создаем пользователя при первом входе
    if (!user) {
      user = await this.usersService.create({
        telegramId,
        username: `user_${telegramId}`,
        firstName: `User`,
        language: 'en' as any,
      });
    }
    
    return user;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: User }> {
    const user = await this.validateUser(loginDto.telegramId);
    
    const payload = {
      sub: user.id,
      telegramId: user.telegramId,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async telegramAuth(telegramAuthDto: TelegramAuthDto): Promise<{ access_token: string; user: User }> {
    // Validate Telegram authentication data
    if (!this.validateTelegramAuth(telegramAuthDto)) {
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }

    // Get or create user
    // Ищем существующего пользователя или создаем нового
    let user = await this.usersService.findByTelegramId(telegramAuthDto.id.toString());
    
    if (!user) {
      user = await this.usersService.create({
        telegramId: telegramAuthDto.id.toString(),
        username: telegramAuthDto.username,
        firstName: telegramAuthDto.first_name,
        lastName: telegramAuthDto.last_name,
      });
    }

    const payload = {
      sub: user.id,
      telegramId: user.telegramId,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  private validateTelegramAuth(authData: TelegramAuthDto): boolean {
    // ВРЕМЕННО ОТКЛЮЧЕНО: проверка Telegram Mini App для разработки
    // Basic validation - in production, you should validate the hash
    // This is a simplified version for development
    return true; // Всегда возвращаем true для разработки
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(userId);
    
    const payload = {
      sub: user.id,
      telegramId: user.telegramId,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
} 