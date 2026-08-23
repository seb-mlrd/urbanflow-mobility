import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { CurrentProfileInterceptor } from './current-profile.interceptor.js';
import { ProfileService } from './profile.service.js';
import type { RequestWithProfile } from './current-profile.decorator.js';

const mockProfileService = { findByUserId: jest.fn() };

function createContext(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

const nextHandle: CallHandler = { handle: () => of('handled') };

describe('CurrentProfileInterceptor', () => {
  let interceptor: CurrentProfileInterceptor;

  beforeEach(() => {
    interceptor = new CurrentProfileInterceptor(
      mockProfileService as unknown as ProfileService,
    );
    jest.clearAllMocks();
  });

  it('résout le profil via le JWT et l’attache à la requête avant de continuer', async () => {
    const profile = { id: 'profile-abc' };
    mockProfileService.findByUserId.mockResolvedValue(profile);
    const request = { user: { sub: 'user-123' } } as RequestWithProfile;
    const context = createContext(request);

    const result = await firstValueFrom(
      interceptor.intercept(context, nextHandle),
    );

    expect(mockProfileService.findByUserId).toHaveBeenCalledWith('user-123');
    expect(request.profile).toBe(profile);
    expect(result).toBe('handled');
  });
});
