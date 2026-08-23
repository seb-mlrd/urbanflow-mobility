import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';
import { ProfileService } from './profile.service.js';
import type { RequestWithProfile } from './current-profile.decorator.js';

// Résout une fois le profil du user authentifié (via JwtAuthGuard) et
// l'attache à la requête, pour que @CurrentProfile() le lise sans que
// chaque controller ne rappelle ProfileService.findByUserId lui-même.
@Injectable()
export class CurrentProfileInterceptor implements NestInterceptor {
  constructor(private readonly profileService: ProfileService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return from(this.profileService.findByUserId(request.user.sub)).pipe(
      switchMap((profile) => {
        (request as RequestWithProfile).profile = profile;
        return next.handle();
      }),
    );
  }
}
