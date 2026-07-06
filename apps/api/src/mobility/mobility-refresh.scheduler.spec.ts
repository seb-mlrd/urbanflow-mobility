import { Test, TestingModule } from '@nestjs/testing';
import { MobilityRefreshScheduler } from './mobility-refresh.scheduler.js';
import { VlilleService } from './vlille.service.js';
import { LimeService } from './lime.service.js';

describe('MobilityRefreshScheduler', () => {
  let scheduler: MobilityRefreshScheduler;
  const mockVlille = { refresh: jest.fn() };
  const mockLime = { refresh: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobilityRefreshScheduler,
        { provide: VlilleService, useValue: mockVlille },
        { provide: LimeService, useValue: mockLime },
      ],
    }).compile();

    scheduler = module.get<MobilityRefreshScheduler>(MobilityRefreshScheduler);
    jest.clearAllMocks();
    mockVlille.refresh.mockResolvedValue(undefined);
    mockLime.refresh.mockResolvedValue(undefined);
  });

  it('rafraîchit les deux providers au démarrage du module', async () => {
    await scheduler.onModuleInit();

    expect(mockVlille.refresh).toHaveBeenCalledTimes(1);
    expect(mockLime.refresh).toHaveBeenCalledTimes(1);
  });

  it("l'échec d'un provider au démarrage n'empêche pas l'autre de se rafraîchir", async () => {
    mockVlille.refresh.mockRejectedValue(new Error('boom'));

    await scheduler.onModuleInit();

    expect(mockLime.refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshVlille() et refreshLime() appellent chacun leur service respectif', async () => {
    await scheduler.refreshVlille();
    await scheduler.refreshLime();

    expect(mockVlille.refresh).toHaveBeenCalledTimes(1);
    expect(mockLime.refresh).toHaveBeenCalledTimes(1);
  });
});
