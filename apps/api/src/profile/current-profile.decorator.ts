import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';
import type { Profile } from './profile.entity.js';

export interface RequestWithProfile extends AuthenticatedRequest {
  profile: Profile;
}

// Nécessite CurrentProfileInterceptor sur le controller/la route pour que
// `request.profile` soit déjà résolu.
export const CurrentProfile = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Profile => {
    return ctx.switchToHttp().getRequest<RequestWithProfile>().profile;
  },
);
