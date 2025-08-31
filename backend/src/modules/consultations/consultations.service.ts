import { Injectable, NotFoundException } from '@nestjs/common';
import { Consultation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createConsultationDto: CreateConsultationDto): Promise<Consultation> {
    return await this.prisma.consultation.create({
      data: {
        ...createConsultationDto,
        userId,
        scheduledAt: new Date(createConsultationDto.scheduledAt),
      }
    });
  }

  async findAll(): Promise<Consultation[]> {
    return await this.prisma.consultation.findMany({
      orderBy: { scheduledAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            telegramId: true,
          }
        }
      }
    });
  }

  async findByUserId(userId: string): Promise<Consultation[]> {
    return await this.prisma.consultation.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'desc' }
    });
  }

  async findOne(id: string): Promise<Consultation> {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            telegramId: true,
          }
        }
      }
    });

    if (!consultation) {
      throw new NotFoundException(`Консультация с ID ${id} не найдена`);
    }

    return consultation;
  }

  async update(id: string, updateConsultationDto: UpdateConsultationDto): Promise<Consultation> {
    await this.findOne(id);

    const updateData = { ...updateConsultationDto };
    if (updateConsultationDto.scheduledAt) {
      updateData.scheduledAt = new Date(updateConsultationDto.scheduledAt) as any;
    }

    return await this.prisma.consultation.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    
    await this.prisma.consultation.delete({
      where: { id }
    });
  }

  async getAvailableSlots(): Promise<{ availableSlots: string[] }> {
    // Простая логика генерации доступных слотов
    const availableSlots = [];
    const now = new Date();
    
    // Генерируем слоты на следующие 30 дней
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Рабочие часы: 9:00 - 18:00
      for (let hour = 9; hour <= 17; hour++) {
        const slot = new Date(date);
        slot.setHours(hour, 0, 0, 0);
        
        // Проверяем, что слот не занят
        const existingConsultation = await this.prisma.consultation.findFirst({
          where: {
            scheduledAt: slot,
            status: {
              in: ['pending', 'confirmed']
            }
          }
        });
        
        if (!existingConsultation) {
          availableSlots.push(slot.toISOString());
        }
      }
      
      // Ограничиваем количество возвращаемых слотов
      if (availableSlots.length >= 50) {
        break;
      }
    }

    return { availableSlots };
  }
}