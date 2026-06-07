import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

import * as bcrypt from 'bcrypt';

const mockUser: User = {
  id: 'uuid-1',
  email: 'jean@example.com',
  password: 'hashed-password',
  firstName: 'Jean',
  lastName: 'Dupont',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  create: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register()', () => {
    const dto = {
      email: 'jean@example.com',
      password: 'motdepasse',
      firstName: 'Jean',
      lastName: 'Dupont',
    };

    it('retourne le user sans le champ password', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(dto);

      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
    });

    it('hache le mot de passe avant de créer le user', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
    });

    it("lève ConflictException si l'email est déjà utilisé (code PG 23505)", async () => {
      const pgError = { code: '23505' };
      mockUsersService.create.mockRejectedValue(pgError);

      await expect(service.register(dto)).rejects.toThrow(
        new ConflictException('Cette adresse email est déjà utilisée.'),
      );
    });

    it('relance les erreurs DB non liées à la contrainte unique', async () => {
      const dbError = new Error('connexion perdue');
      mockUsersService.create.mockRejectedValue(dbError);

      await expect(service.register(dto)).rejects.toThrow('connexion perdue');
    });
  });
});
