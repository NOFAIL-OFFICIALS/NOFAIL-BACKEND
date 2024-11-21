import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingBotController } from './shopping_bot.controller';

describe('ShoppingBotController', () => {
  let controller: ShoppingBotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShoppingBotController],
    }).compile();

    controller = module.get<ShoppingBotController>(ShoppingBotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
