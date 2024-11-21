import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingBotService } from './shopping_bot.service';

describe('ShoppingBotService', () => {
  let service: ShoppingBotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShoppingBotService],
    }).compile();

    service = module.get<ShoppingBotService>(ShoppingBotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
