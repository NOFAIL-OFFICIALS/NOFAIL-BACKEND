import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/utils/cloudinary.service';
import { Express } from 'express';
import { ActiveUser } from 'src/iam/authentication/decorators/ActiveUser.decorator';
import { ActiveUserDTO } from 'src/iam/authentication/dto/activeUser.dto';
import { validateProductData } from './product.validation';
import { UpdateProductDto } from './dto/update.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productService.getProducts(page, limit);
  }

  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
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
      return this.productService.createProduct({
        ...validatedData,
        image_url: imageUrl,
        user_id: user.sub.toString(),
      });
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'An unexpected error occurred while creating a product. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:id')
  async getProductById(@Param('id') id: string) {
    try {
      return this.productService.getProductById(id);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'An unexpected error occurred while fetching a product. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('/update/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ) {
    try {
      if (!product || Object.keys(product).length === 0) {
        throw new BadRequestException({
          status: 'error',
          message: 'Request body cannot be empty',
          data: null,
        });
      }

      return this.productService.updateProduct(id, product);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'An unexpected error occurred while updating a product. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/delete/:id')
  async deleteProduct(@Param('id') id: string) {
    try {
      return this.productService.deleteProduct(id);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'An unexpected error occurred while deleting a product. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
