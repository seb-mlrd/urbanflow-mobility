import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JourneyHistoryService } from './journey-history.service.js';
import { JourneyHistory } from './journey-history.entity.js';

const mockQueryBuilder = {
  select: jest.fn(),
  addSelect: jest.fn(),
  where: jest.fn(),
  andWhere: jest.fn(),
  getRawOne: jest.fn(),
};

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const dto = {
  dominantMode: 'BICYCLE',
  distanceMeters: 4200,
  durationSeconds: 900,
  co2Grams: 0,
  fromLabel: 'Grand-Place',
  toLabel: 'Wazemmes',
  fromLat: 50.6365,
  fromLng: 3.0635,
  toLat: 50.6292,
  toLng: 3.0573,
  departureAt: 1_000_000,
  arrivalAt: 1_900_000,
};

describe('JourneyHistoryService', () => {
  let service: JourneyHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyHistoryService,
        { provide: getRepositoryToken(JourneyHistory), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<JourneyHistoryService>(JourneyHistoryService);
    jest.clearAllMocks();
    mockQueryBuilder.select.mockReturnThis();
    mockQueryBuilder.addSelect.mockReturnThis();
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  describe('create()', () => {
    it('convertit departureAt/arrivalAt en Date et attache le profileId', async () => {
      mockRepo.create.mockImplementation((v) => v);
      mockRepo.save.mockImplementation((v) => Promise.resolve(v));

      const result = await service.create('profile-123', dto);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        profileId: 'profile-123',
        departureAt: new Date(dto.departureAt),
        arrivalAt: new Date(dto.arrivalAt),
      });
      expect(result.profileId).toBe('profile-123');
      expect(result.departureAt).toEqual(new Date(dto.departureAt));
    });
  });

  describe('findRecentForProfile()', () => {
    it('retourne les trajets du profil, les plus récents en premier, limités à 10', async () => {
      mockRepo.find.mockResolvedValue([{ id: 'history-1', ...dto }]);

      const result = await service.findRecentForProfile('profile-123');

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { profileId: 'profile-123' },
        order: { departureAt: 'DESC' },
        take: 10,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getMonthlyStats()', () => {
    it('agrège co2Grams et le nombre de trajets du profil pour le mois en cours', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({
        co2Grams: '1930',
        trips: '3',
      });

      const result = await service.getMonthlyStats('profile-123');

      expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('journey');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'journey.profileId = :profileId',
        { profileId: 'profile-123' },
      );
      expect(result).toEqual({ co2GramsThisMonth: 1930, tripsThisMonth: 3 });
    });

    it('retourne 0/0 si aucun trajet ce mois-ci', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({
        co2Grams: '0',
        trips: '0',
      });

      const result = await service.getMonthlyStats('profile-123');

      expect(result).toEqual({ co2GramsThisMonth: 0, tripsThisMonth: 0 });
    });
  });
});
