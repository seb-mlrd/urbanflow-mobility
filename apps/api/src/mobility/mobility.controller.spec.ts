import { Test, TestingModule } from '@nestjs/testing';
import { MobilityController } from './mobility.controller.js';
import { VlilleService } from './vlille.service.js';
import { LimeService } from './lime.service.js';

const mockVlilleService = { getSnapshotOrThrow: jest.fn() };
const mockLimeService = { getSnapshotOrThrow: jest.fn() };

describe('MobilityController', () => {
  let controller: MobilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobilityController],
      providers: [
        { provide: VlilleService, useValue: mockVlilleService },
        { provide: LimeService, useValue: mockLimeService },
      ],
    }).compile();

    controller = module.get<MobilityController>(MobilityController);
    jest.clearAllMocks();
  });

  it('getBikes() délègue à VlilleService', async () => {
    const snapshot = { vehicles: [], lastUpdated: 1, fetchedAt: 2 };
    mockVlilleService.getSnapshotOrThrow.mockResolvedValue(snapshot);

    await expect(controller.getBikes()).resolves.toBe(snapshot);
    expect(mockVlilleService.getSnapshotOrThrow).toHaveBeenCalled();
  });

  it('getScooters() délègue à LimeService', async () => {
    const snapshot = { vehicles: [], lastUpdated: 1, fetchedAt: 2 };
    mockLimeService.getSnapshotOrThrow.mockResolvedValue(snapshot);

    await expect(controller.getScooters()).resolves.toBe(snapshot);
    expect(mockLimeService.getSnapshotOrThrow).toHaveBeenCalled();
  });
});
