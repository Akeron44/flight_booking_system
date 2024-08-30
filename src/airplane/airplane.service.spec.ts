import { Test, TestingModule } from '@nestjs/testing';
import { AirplaneService } from './airplane.service';

describe('AirplaneService', () => {
  let service: AirplaneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirplaneService],
    }).compile();

    service = module.get<AirplaneService>(AirplaneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
