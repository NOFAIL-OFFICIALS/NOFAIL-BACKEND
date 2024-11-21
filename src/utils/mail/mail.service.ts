import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface LowStockAlertData {
  productName: string;
  currentStock: number;
  optimalStock: number;
  sku: string;
  recipients?: string[];
}

interface OrderConfirmationData {
  orderNumber: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  estimatedDelivery: Date;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendLowStockAlert(data: LowStockAlertData): Promise<void> {
    const recipients = data.recipients || ['inventory-manager@company.com'];

    try {
      await this.mailerService.sendMail({
        to: recipients,
        subject: `Low Stock Alert: ${data.productName}`,
        template: 'low',
        context: {
          ...data,
          reorderLink: `http://localhost:3000/inventory/reorder/${data.sku}`,
        },
      });

      this.logger.log(`Low stock alert sent for product: ${data.productName}`);
    } catch (error) {
      this.logger.error(
        `Failed to send low stock alert for product: ${data.productName}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: 'supplier@example.com',
        subject: `Order Confirmation #${data.orderNumber}`,
        template: 'order-confirmation',
        context: {
          ...data,
          formattedDeliveryDate: data.estimatedDelivery.toLocaleDateString(),
        },
      });

      this.logger.log(`Order confirmation sent for order: ${data.orderNumber}`);
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation for order: ${data.orderNumber}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendStockReport(reportData: any): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: ['manager@company.com', 'supervisor@company.com'],
        subject: 'Daily Stock Report',
        template: 'stock-report',
        context: {
          ...reportData,
          date: new Date().toLocaleDateString(),
        },
      });

      this.logger.log('Daily stock report sent successfully');
    } catch (error) {
      this.logger.error('Failed to send daily stock report', error.stack);
      throw error;
    }
  }
}
