import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  BadRequestException,
  FileTypeValidator,
  ForbiddenException,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { ActiveUser } from 'src/iam/authentication/decorators/ActiveUser.decorator';
import { ActiveUserDTO } from 'src/iam/authentication/dto/activeUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { validateProductData } from 'src/product/product.validation';
import { ProductService } from 'src/product/product.service';
import { CloudinaryService } from 'src/utils/cloudinary.service';

@Controller('shops')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  async create(
    @Body() createShopDto: CreateShopDto,
    @ActiveUser() user: ActiveUserDTO,
  ) {
    try {
      return await this.shopService.create({
        ...createShopDto,
        user_id: user.sub.toString(),
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':shopId/products')
  @UseInterceptors(FileInterceptor('image'))
  async addProductToShop(
    @Param('shopId') shopId: string,
    @Body() product: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    image: Express.Multer.File,
    @ActiveUser() user: ActiveUserDTO,
  ) {
    try {
      // Verify shop belongs to user
      const shop = await this.shopService.findById(shopId);
      if (shop.user_id !== user.sub.toString()) {
        throw new ForbiddenException(
          'You can only add products to your own shops',
        );
      }

      const validatedData = validateProductData(product);

      let imageUrl = null;

      if (image) {
        // Validate image file
        if (!image.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          throw new BadRequestException(
            'Only image files (jpg, jpeg, png, gif) are allowed',
          );
        }
        if (image.size > 5 * 1024 * 1024) {
          // 5MB limit
          throw new BadRequestException('Image size must be less than 5MB');
        }

        imageUrl = await this.cloudinaryService.uploadImage(image);
      }

      // Create the product
      const newProduct = await this.productService.createProduct({
        ...validatedData,
        image_url: imageUrl,
        user_id: user.sub.toString(),
      });

      // Add product to shop
      await this.shopService.addProductToShop(
        shopId,
        newProduct._id.toString(),
      );

      return {
        success: true,
        message: 'Product added to shop successfully',
        data: newProduct,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'An unexpected error occurred while adding product to shop. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
