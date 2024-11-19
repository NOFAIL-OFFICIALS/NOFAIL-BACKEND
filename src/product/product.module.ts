import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, productSchema } from './entity/product.entity';
import { CloudinaryService } from 'src/utils/cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: productSchema }]),
  ],
  providers: [ProductService, CloudinaryService],
  controllers: [ProductController],
})
export class ProductModule {}
