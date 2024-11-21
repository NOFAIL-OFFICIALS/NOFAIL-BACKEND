import { Module } from '@nestjs/common';
import { ChatController } from './shopping_bot.controller';
import { ChatService } from './shopping_bot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat } from './enitity/chat.entity';
import { ChatSchema } from './enitity/chat.entity';
import { PaymentService } from 'src/utils/payment/payment.service';
import { OpenAIService } from 'src/utils/openai/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService, OpenAIService, PaymentService],
})
export class ShoppingBotModule {}
