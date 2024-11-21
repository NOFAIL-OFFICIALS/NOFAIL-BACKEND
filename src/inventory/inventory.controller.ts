import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  HttpStatus,
  HttpException,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { SimpleProduct } from './dto/simple.dto';

@Controller('inventory')
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  // Trigger manual stock check
  @HttpCode(HttpStatus.OK)
  @Post('check-stock')
  async checkStock() {
    try {
      const result = await this.inventoryService.checkStockLevels();
      return {
        ...result,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to check stock levels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('check-product')
  async checkStockNoId(@Body() productData: SimpleProduct) {
    try {
      return this.inventoryService.checkStockLevelsNoId(productData);
    } catch (error) {
      this.logger.error(
        `Failed to check stock for product ${productData?.name}: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to check stock levels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Get optimum stock for a specific product
  @Get('optimum-stock/:productId')
  async getOptimumStock(@Param('productId') productId: string) {
    try {
      const result =
        await this.inventoryService.getProductOptimumStock(productId);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get optimum stock',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get current stock levels for all products
  @Get('stock-levels')
  async getAllStockLevels() {
    try {
      const stockLevels = await this.inventoryService.getAllStockLevels();
      return stockLevels;
    } catch (error) {
      throw new HttpException(
        'Failed to get stock levels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get stock level for a specific product
  @Get('stock-level/:productId')
  async getProductStockLevel(@Param('productId') productId: string) {
    try {
      const stockLevel =
        await this.inventoryService.getProductStockLevel(productId);
      return stockLevel;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get stock level',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
