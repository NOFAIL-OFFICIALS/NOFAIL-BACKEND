import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { IamModule } from './iam/iam.module';
import { ProductModule } from './product/product.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { InventoryModule } from './inventory/inventory.module';
import { MailModule } from './utils/mail/mail.module';
import { ShopModule } from './shop/shop.module';
import { ShoppingBotModule } from './shopping_bot/shopping_bot.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    UsersModule,
    IamModule,
    ProductModule,
    ChatbotModule,
    InventoryModule,
    MailModule,
    ShopModule,
    ShoppingBotModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
