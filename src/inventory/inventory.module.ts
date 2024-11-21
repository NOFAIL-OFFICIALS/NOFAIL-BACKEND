import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, productSchema } from 'src/product/entity/product.entity';
import { MailModule } from 'src/utils/mail/mail.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MailModule,
    HttpModule,
    MongooseModule.forFeature([{ name: Product.name, schema: productSchema }]),
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
