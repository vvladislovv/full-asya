import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DementiaRiskLevel, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateLanguageDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Проверяем существование пользователя с таким telegramId
      const existingUser = await this.prisma.user.findUnique({
        where: { telegramId: createUserDto.telegramId }
      });

      if (existingUser) {
        throw new ConflictException(`Пользователь с Telegram ID ${createUserDto.telegramId} уже существует`);
      }

      return await this.prisma.user.create({
        data: createUserDto
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Ошибка при создании пользователя');
    }
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { telegramId }
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Проверяем существование пользователя
    await this.findOne(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw new ConflictException('Ошибка при обновлении пользователя');
    }
  }

  async updateLanguage(id: string, updateLanguageDto: UpdateLanguageDto): Promise<User> {
    // Проверяем существование пользователя
    await this.findOne(id);

    return await this.prisma.user.update({
      where: { id },
      data: {
        language: updateLanguageDto.language,
        updatedAt: new Date()
      }
    });
  }

  async updateDementiaRisk(
    id: string, 
    dementiaRiskLevel: DementiaRiskLevel, 
    dementiaQuestionnaire?: any
  ): Promise<User> {
    // Проверяем существование пользователя
    await this.findOne(id);

    return await this.prisma.user.update({
      where: { id },
      data: {
        dementiaRiskLevel,
        dementiaQuestionnaire,
        hasCompletedDiagnostic: true,
        updatedAt: new Date()
      }
    });
  }

  async remove(id: string): Promise<void> {
    // Проверяем существование пользователя
    await this.findOne(id);

    // Мягкое удаление
    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });
  }

  async getStats() {
    const [
      totalUsers,
      activeUsers,
      completedDiagnostic,
      riskLevels
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { hasCompletedDiagnostic: true } }),
      this.prisma.user.groupBy({
        by: ['dementiaRiskLevel'],
        _count: {
          id: true
        },
        where: {
          dementiaRiskLevel: { not: null }
        }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      completedDiagnostic,
      riskLevels: riskLevels.reduce((acc, item) => {
        acc[item.dementiaRiskLevel] = item._count.id;
        return acc;
      }, {})
    };
  }
}