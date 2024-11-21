import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shop } from './entity/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ShopService {
  constructor(@InjectModel(Shop.name) private shopModel: Model<Shop>) {}

  private async generateUniqueSlug(): Promise<string> {
    let urlSlug: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate a random slug
      urlSlug = randomBytes(3).toString('hex'); // Hex gives alphanumeric characters only
      const existingShop = await this.shopModel.findOne({
        unique_url: urlSlug,
      });
      if (!existingShop) {
        isUnique = true;
      }
    }
    console.log(urlSlug);
    return urlSlug;
  }

  async findById(shopId: string) {
    const shop = await this.shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return shop;
  }

  async create(createShopDto: CreateShopDto & { user_id: string }) {
    try {
      const urlSlug = await this.generateUniqueSlug();
      console.log(urlSlug);
      const shopData = {
        ...createShopDto,
        unique_url: urlSlug,
        user_id: createShopDto.user_id,
      };

      const data = await this.shopModel.create({
        name: shopData.shopName,
        category: shopData.category,
        contact: shopData.contact,
        unique_url: shopData.unique_url,
        user_id: shopData.user_id,
      });

      return {
        success: true,
        message: 'Shop created successfully',
        shopUrl: `nofail.com/shop/${data.unique_url}`,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Shop with this name already exists');
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the shop',
      );
    }
  }

  async addProductToShop(shopId: string, productId: string) {
    try {
      // Add product reference to shop
      await this.shopModel.findByIdAndUpdate(
        shopId,
        { $push: { products: productId } },
        { new: true },
      );

      return {
        success: true,
        message: 'Product added to shop successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while adding product to shop',
      );
    }
  }
}
