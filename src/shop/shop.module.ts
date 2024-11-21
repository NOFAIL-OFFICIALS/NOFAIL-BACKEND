import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './entity/shop.entity';
import { ProductModule } from 'src/product/product.module';
import { CloudinaryService } from 'src/utils/cloudinary.service';
import { ProductService } from 'src/product/product.service';
import { Product, productSchema } from 'src/product/entity/product.entity';

@Module({
  imports: [
    ProductModule,
    MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: productSchema }]),
  ],
  controllers: [ShopController],
  providers: [ShopService, CloudinaryService, ProductService],
})
export class ShopModule {}
