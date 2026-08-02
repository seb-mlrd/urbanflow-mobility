import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './jwt-payload.type.js';
import { ROLES_KEY } from './roles.decorator.js';
import type { UserRole } from '../users/user.entity.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Accès réservé aux administrateurs.');
    }

    return true;
  }
}
