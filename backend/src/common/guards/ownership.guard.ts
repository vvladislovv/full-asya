import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Пользователь не аутентифицирован');
    }

    // Администраторы имеют доступ ко всем ресурсам
    if (user.isAdmin) {
      return true;
    }

    // Получаем конфигурацию из декоратора
    const resourceConfig = this.reflector.get<{
      entity: string;
      param: string;
      relation?: string;
    }>('ownership', context.getHandler());

    if (!resourceConfig) {
      return true; // Если конфигурация не задана, пропускаем проверку
    }

    const resourceId = request.params[resourceConfig.param];
    if (!resourceId) {
      throw new ForbiddenException('ID ресурса не найден');
    }

    // Проверяем владение ресурсом
    const isOwner = await this.checkOwnership(
      resourceConfig.entity,
      resourceId,
      user.id,
      resourceConfig.relation
    );

    if (!isOwner) {
      throw new ForbiddenException('У вас нет доступа к этому ресурсу');
    }

    return true;
  }

  private async checkOwnership(
    entity: string,
    resourceId: string,
    userId: string,
    relation?: string
  ): Promise<boolean> {
    try {
      let where: any = { id: resourceId };
      
      if (relation) {
        // Проверка через связанную сущность
        where[`${relation}.userId`] = userId;
      } else {
        // Прямая проверка владения
        where.userId = userId;
      }

      const resource = await (this.prisma as any)[entity].findUnique({
        where,
        select: { id: true }
      });

      return !!resource;
    } catch (error) {
      return false;
    }
  }
}