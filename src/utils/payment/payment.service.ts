import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private paystack: any;

  constructor(private configService: ConfigService) {
    // this.paystack = new Paystack(this.configService.get('PAYSTACK_SECRET_KEY'));
  }

  async createPaymentLink(params: {
    amount: number;
    productName: string;
    email: string;
  }): Promise<string> {
    try {
      // //   const response = await this.paystack.transaction.initialize({
      // //     amount: params.amount * 100, // Convert to kobo
      // //     email: params.email,
      // //     callback_url: `${this.configService.get('APP_URL')}/payment/callback`,
      //     metadata: {
      //       product_name: params.productName,
      //     },
      //   });

      return 'payment link';
    } catch (error) {
      console.error('Payment link generation error:', error);
      throw error;
    }
  }

  //   async verifyPayment(reference: string) {
  //     try {
  //       const response = await this.paystack.transaction.verify(reference);
  //       return response.data;
  //     } catch (error) {
  //       console.error('Payment verification error:', error);
  //       throw error;
  //     }
  //   }
}
