import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JourneyHistoryService } from './journey-history.service.js';
import { JourneyHistory } from './journey-history.entity.js';

const mockQueryBuilder = {
  select: jest.fn(),
  addSelect: jest.fn(),
  where: jest.fn(),
  andWhere: jest.fn(),
  groupBy: jest.fn(),
  orderBy: jest.fn(),
  getRawOne: jest.fn(),
  getRawMany: jest.fn(),
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
    mockQueryBuilder.groupBy.mockReturnThis();
    mockQueryBuilder.orderBy.mockReturnThis();
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
    it('retourne les trajets du profil, les plus récents en premier, limités à 50 par défaut', async () => {
      mockRepo.find.mockResolvedValue([{ id: 'history-1', ...dto }]);

      const result = await service.findRecentForProfile('profile-123');

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { profileId: 'profile-123' },
        order: { departureAt: 'DESC' },
        take: 50,
      });
      expect(result).toHaveLength(1);
    });

    it('borne la limite demandée entre 1 et 100', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.findRecentForProfile('profile-123', 500);
      expect(mockRepo.find).toHaveBeenLastCalledWith(
        expect.objectContaining({ take: 100 }),
      );

      await service.findRecentForProfile('profile-123', 0);
      expect(mockRepo.find).toHaveBeenLastCalledWith(
        expect.objectContaining({ take: 1 }),
      );
    });
  });

  describe('getMonthlyStats()', () => {
    it('agrège co2Grams, distance, durée et le nombre de trajets du profil pour le mois en cours', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({
        co2Grams: '1930',
        trips: '3',
        distanceMeters: '15000',
        durationSeconds: '3600',
      });

      const result = await service.getMonthlyStats('profile-123');

      expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('journey');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'journey.profileId = :profileId',
        { profileId: 'profile-123' },
      );
      expect(result).toEqual({
        co2GramsThisMonth: 1930,
        tripsThisMonth: 3,
        distanceMetersThisMonth: 15000,
        durationSecondsThisMonth: 3600,
      });
    });

    it('retourne 0 partout si aucun trajet ce mois-ci', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({
        co2Grams: '0',
        trips: '0',
        distanceMeters: '0',
        durationSeconds: '0',
      });

      const result = await service.getMonthlyStats('profile-123');

      expect(result).toEqual({
        co2GramsThisMonth: 0,
        tripsThisMonth: 0,
        distanceMetersThisMonth: 0,
        durationSecondsThisMonth: 0,
      });
    });
  });

  describe('getMonthlyCo2Breakdown()', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-03-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('retourne les N derniers mois, zéro-comblés, triés du plus ancien au plus récent', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { month: '2026-01', co2Grams: '500' },
        { month: '2026-03', co2Grams: '1200' },
      ]);

      const result = await service.getMonthlyCo2Breakdown('profile-123', 3);

      expect(result).toEqual([
        { month: '2026-01', co2Grams: 500 },
        { month: '2026-02', co2Grams: 0 },
        { month: '2026-03', co2Grams: 1200 },
      ]);
    });

    it('borne le nombre de mois demandé entre 1 et 24', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getMonthlyCo2Breakdown('profile-123', 100);
      expect(result).toHaveLength(24);

      const resultMin = await service.getMonthlyCo2Breakdown('profile-123', 0);
      expect(resultMin).toHaveLength(1);
    });
  });
});
