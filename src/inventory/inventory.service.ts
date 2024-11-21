import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/product/entity/product.entity';
import { HttpService } from '@nestjs/axios';
import { MailService } from 'src/utils/mail/mail.service';
import { SimpleProduct } from './dto/simple.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectModel(Product.name) private inventoryModel: Model<Product>,
    private httpService: HttpService,
    private mailService: MailService,
  ) {}

  async checkStockLevels(): Promise<{
    summary: {
      totalProducts: number;
      lowStockCount: number;
      sufficientStockCount: number;
      failedChecks: number;
    };
    stockStatus: Array<{
      productName: string;
      status: 'LOW' | 'SUFFICIENT';
      current: number;
      optimal: number;
      deficit?: number;
      excess?: number;
    }>;
    errors?: Array<{
      type: string;
      product: string;
      error: string;
    }>;
  }> {
    try {
      const products = await this.inventoryModel.find();
      const stockStatus = [];
      const errors = [];

      for (const product of products) {
        try {
          const optimumStock = await this.getOptimumStock(product);

          if (optimumStock) {
            if (product.stock < optimumStock) {
              try {
                // Only send email for low stock
                await this.sendAlert(product, optimumStock);
                stockStatus.push({
                  productName: product.name,
                  status: 'LOW',
                  current: product.stock,
                  optimal: optimumStock,
                  deficit: optimumStock - product.stock,
                });
              } catch (emailError) {
                errors.push({
                  type: 'EMAIL_ERROR',
                  product: product.name,
                  error: emailError.message,
                });
              }
            } else {
              stockStatus.push({
                productName: product.name,
                status: 'SUFFICIENT',
                current: product.stock,
                optimal: optimumStock,
                excess: product.stock - optimumStock,
              });
            }
          } else {
            errors.push({
              type: 'OPTIMUM_STOCK_ERROR',
              product: product.name,
              error: 'Failed to calculate optimum stock',
            });
          }
        } catch (productError) {
          errors.push({
            type: 'PRODUCT_PROCESSING_ERROR',
            product: product.name,
            error: productError.message,
          });
        }
      }

      // Return JSON response
      return {
        summary: {
          totalProducts: products.length,
          lowStockCount: stockStatus.filter((s) => s.status === 'LOW').length,
          sufficientStockCount: stockStatus.filter(
            (s) => s.status === 'SUFFICIENT',
          ).length,
          failedChecks: errors.length,
        },
        stockStatus,
        ...(errors.length > 0 && { errors }),
      };
    } catch (error) {
      this.logger.error('Failed to complete stock level check:', error.message);
      throw new Error('Stock level check failed');
    }
  }

  //   async checkStockLevels(): Promise<void> {
  //     const products = await this.inventoryModel.find();
  //     const stockStatus = [];

  //     for (const product of products) {
  //       const optimumStock = await this.getOptimumStock(product);

  //       if (product.stock < optimumStock) {
  //         await this.sendAlert(product, optimumStock);
  //         stockStatus.push({
  //           productName: product.name,
  //           status: 'LOW',
  //           current: product.stock,
  //           required: optimumStock,
  //           deficit: optimumStock - product.stock,
  //         });
  //       } else {
  //         stockStatus.push({
  //           productName: product.name,
  //           status: 'SUFFICIENT',
  //           current: product.stock,
  //           optimal: optimumStock,
  //           excess: product.stock - optimumStock,
  //         });
  //       }
  //     }

  //     // Log the status report
  //     this.logger.log('Stock Level Check Complete');
  //     stockStatus.forEach((status) => {
  //       if (status.status === 'LOW') {
  //         this.logger.warn(
  //           `${status.productName}: LOW STOCK - Current: ${status.current}, ` +
  //             `Required: ${status.required}, Deficit: ${status.deficit}`,
  //         );
  //       } else {
  //         this.logger.log(
  //           `${status.productName}: SUFFICIENT STOCK - Current: ${status.current}, ` +
  //             `Optimal: ${status.optimal}, Excess: ${status.excess}`,
  //         );
  //       }
  //     });

  //     // Send a comprehensive stock report via email
  //     await this.mailService.sendStockReport({
  //       stockStatus,
  //       checkDate: new Date(),
  //       totalProducts: products.length,
  //       lowStockCount: stockStatus.filter((s) => s.status === 'LOW').length,
  //     });
  //   }

  private async getOptimumStock(product: Product): Promise<number> {
    let optimumStock: number;
    const seasonality = this.getCurrentSeason();
    const exchangeRate = await this.getCurrentExchangeRate();
    const inflationRate = await this.getCurrentInflationRate();
    const newDataFormat = `${product.name}`;
    try {
      const modelRequest = {
        Seasonality: 'Dry',
        Product_name: 'Laptop',
        Unit_price: Number(product.price),
        Lead_time: 7,
        Exchange_rate: exchangeRate,
        Inflation_rate: inflationRate,
      };

      try {
        const response = await this.httpService.axiosRef.post(
          'https://aiinventory-nofail-1.fly.dev/predict',
          modelRequest,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        return response.data.predicted_quantities[0];
      } catch (error) {
        this.logger.error(
          `Failed to get optimum stock for product ${product.id} + ${error}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to get optimum stock for product ${product.id}`,
      );
      throw error;
    }
  }

  private async getOptimumStockNoDB(product: SimpleProduct): Promise<number> {
    let optimumStock: number;
    const seasonality = this.getCurrentSeason();
    const exchangeRate = await this.getCurrentExchangeRate();
    const inflationRate = await this.getCurrentInflationRate();
    const newDataFormat = `${product.name}`;
    try {
      const modelRequest = {
        Seasonality: 'Dry',
        Product_name: 'Laptop',
        Unit_price: Number(product.price),
        Lead_time: 7,
        Exchange_rate: exchangeRate,
        Inflation_rate: inflationRate,
      };

      try {
        const response = await this.httpService.axiosRef.post(
          'https://aiinventory-nofail-1.fly.dev/predict',
          modelRequest,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        return response.data.predicted_quantities[0];
      } catch (error) {
        this.logger.error(
          `Failed to get optimum stock for product ${product.name} + ${error}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to get optimum stock for product ${product.name}`,
      );
      throw error;
    }
  }

  async checkStockLevelsNoId(productData: SimpleProduct) {
    try {
      const optimumStock = await this.getOptimumStockNoDB({
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
        category: productData.category,
      });

      if (!optimumStock) {
        throw new HttpException(
          'Failed to calculate optimum stock',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const stockDifference = Math.abs(productData.stock - optimumStock);
      const isStockMismatch = productData.stock !== optimumStock;

      if (isStockMismatch) {
        try {
          await this.mailService.sendLowStockAlert({
            productName: productData.name,
            currentStock: productData.stock,
            optimalStock: optimumStock,
            sku: 'N/A',
            recipients: ['adedejiosvaldo@gmail.com'],
          });
        } catch (emailError) {
          this.logger.error(
            `Failed to send stock mismatch alert for ${productData.name}:`,
            emailError.message,
          );
        }
      }

      return {
        name: productData.name,
        optimumStock,
        currentStock: productData.stock,
        status:
          productData.stock < optimumStock
            ? 'LOW'
            : productData.stock > optimumStock
              ? 'EXCESS'
              : 'OPTIMAL',
        difference: stockDifference,
        ...(productData.stock < optimumStock && {
          deficit: optimumStock - productData.stock,
        }),
        ...(productData.stock > optimumStock && {
          excess: productData.stock - optimumStock,
        }),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process stock check for product ${productData.name}:`,
        error.message,
      );
      throw new HttpException(
        'Failed to process stock check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // This matches the original sendAlert method
  private async sendAlert(
    product: Product,
    optimumStock: number,
  ): Promise<void> {
    await this.mailService.sendLowStockAlert({
      productName: product.name,
      currentStock: product.stock,
      optimalStock: optimumStock,
      sku: product.id,
      recipients: ['adedejiosvaldo@gmail.com'],
    });
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  private async getCurrentExchangeRate(): Promise<number> {
    // Implement exchange rate fetching logic
    return 1750; // Example fixed value
  }

  private async getCurrentInflationRate(): Promise<number> {
    // Implement inflation rate fetching logic
    return 20; // Example fixed value
  }

  //

  async getProductOptimumStock(productId: string) {
    try {
      const product = await this.inventoryModel.findById(productId);
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      const optimumStock = await this.getOptimumStock(product);
      if (!optimumStock) {
        throw new HttpException(
          'Failed to calculate optimum stock',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Check if stock is low and send alert
      if (product.stock < optimumStock) {
        try {
          await this.sendAlert(product, optimumStock);
        } catch (emailError) {
          this.logger.error(
            `Failed to send low stock alert for ${product.name}:`,
            emailError.message,
          );
          // Don't throw error here, continue with response
        }
      }

      return {
        productId,
        name: product.name,
        optimumStock,
        currentStock: product.stock,
        status: product.stock < optimumStock ? 'LOW' : 'SUFFICIENT',
        ...(product.stock < optimumStock && {
          deficit: optimumStock - product.stock,
        }),
        ...(product.stock >= optimumStock && {
          excess: product.stock - optimumStock,
        }),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Failed to process optimum stock check for product ${productId}:`,
        error.message,
      );
      throw new HttpException(
        'Failed to process stock check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProductStock(
    productId: string,
    updateData: { quantity: number; type: 'add' | 'remove' },
  ) {
    const product = await this.inventoryModel.findById(productId);
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const newStock =
      updateData.type === 'add'
        ? product.currentStock + updateData.quantity
        : product.currentStock - updateData.quantity;

    if (newStock < 0) {
      throw new HttpException('Insufficient stock', HttpStatus.BAD_REQUEST);
    }

    product.currentStock = newStock;
    await product.save();

    const optimumStock = await this.getOptimumStock(product);
    if (newStock < optimumStock) {
      await this.sendAlert(product, optimumStock);
    }

    return {
      status: 'success',
      message: 'Stock updated successfully',
      newStock,
    };
  }

  async getAllStockLevels() {
    const products = await this.inventoryModel.find();
    const stockLevels = await Promise.all(
      products.map(async (product) => {
        const optimumStock = await this.getOptimumStock(product);
        return {
          productId: product.id,
          name: product.name,
          currentStock: product.currentStock,
          optimumStock,
          status: product.currentStock < optimumStock ? 'Low' : 'Normal',
        };
      }),
    );
    return stockLevels;
  }

  async getProductStockLevel(productId: string) {
    const product = await this.inventoryModel.findById(productId);
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const optimumStock = await this.getOptimumStock(product);
    return {
      productId: product.id,
      name: product.name,
      currentStock: product.currentStock,
      optimumStock,
      status: product.currentStock < optimumStock ? 'Low' : 'Normal',
    };
  }
}
