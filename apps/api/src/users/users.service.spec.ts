import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

const mockUser: User = {
  id: 'uuid-1',
  email: 'jean@example.com',
  password: 'hashed-password',
  firstName: 'Jean',
  lastName: 'Dupont',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('crée et sauvegarde le user avec les bonnes données', async () => {
      const data = {
        email: 'jean@example.com',
        password: 'hashed-password',
        firstName: 'Jean',
        lastName: 'Dupont',
      };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(data);

      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail()', () => {
    it('retourne le user si trouvé', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('jean@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'jean@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('retourne null si le user est introuvable', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('inconnu@example.com');

      expect(result).toBeNull();
    });
  });
});
