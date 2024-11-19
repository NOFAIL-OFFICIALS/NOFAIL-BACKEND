import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { IamModule } from './iam/iam.module';
import { ProductModule } from './product/product.module';
import { ChatbotModule } from './chatbot/chatbot.module';
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
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
