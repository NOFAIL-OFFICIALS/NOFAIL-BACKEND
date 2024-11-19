import {
  Injectable,
  BadRequestException,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entity/product.entity';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async getProducts(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        this.productModel.find().skip(skip).limit(limit).exec(),
        this.productModel.countDocuments(),
      ]);

      return {
        status: 'success',
        message: products.length
          ? 'Products retrieved successfully'
          : 'No products found',
        data: {
          products,
          pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + products.length < total,
          },
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'An unexpected error occurred while fetching products. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductById(id: string) {
    try {
      const existingProduct = await this.productModel.findById(id);

      if (!existingProduct) {
        throw new NotFoundException({
          status: 'error',
          message: 'Product not found',
          data: null,
        });
      }

      const product = await this.productModel.findById(id);
      return {
        status: 'success',
        message: 'Product retrieved successfully',
        data: product,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
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

  async createProduct(product: any): Promise<Product> {
    try {
      const newProduct = await this.productModel.create(product);
      return newProduct;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
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

  async updateProduct(id: string, product: UpdateProductDto): Promise<{}> {
    try {
      const existingProduct = await this.productModel.findById(id);
      if (!existingProduct) {
        throw new NotFoundException({
          status: 'error',
          message: 'Product not found',
          data: null,
        });
      }
      // Check if there are any updates
      if (Object.keys(product).length === 0) {
        throw new BadRequestException({
          status: 'error',
          message: 'No updates provided',
          data: null,
        });
      }

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        product,
        {
          new: true, // Return updated document
          runValidators: true, // Run schema validators
        },
      );

      return {
        status: 'success',
        message: 'Product updated successfully',
        data: updatedProduct,
      };
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

  async deleteProduct(id: string) {
    try {
      const existingProduct = await this.productModel.findById(id);
      if (!existingProduct) {
        throw new NotFoundException({
          status: 'error',
          message: 'Product not found',
          data: null,
        });
      }
      await this.productModel.findByIdAndDelete(id);
      return {
        status: 'success',
        message: 'Product deleted successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
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
