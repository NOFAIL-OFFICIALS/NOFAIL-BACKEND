import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Chat } from './enitity/chat.entity';
import { OpenAIService } from 'src/utils/openai/openai.service';
import { PaymentService } from 'src/utils/payment/payment.service';

@Injectable()
export class ChatService {
  private readonly products = {
    'hp laptop': 250000,
    'dell laptop': 220000,
    'lenovo laptop': 150000,
    'macbook pro': 1241,
    'iphone 14 pro': 1499,
    keyboard: 215,
    'airpods pro': 249,
    'logitech superlight': 500,
    'samsung odyssey': 1999,
  };

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private readonly openAIService: OpenAIService,
    private readonly paymentService: PaymentService,
  ) {}

  async processMessage(
    userId: string,
    message: string,
    conversationHistory: any[] = [],
  ) {
    try {
      // Get AI response
      const aiResponse = await this.openAIService.chatWithBot(
        message,
        conversationHistory,
      );

      // Save chat message
      const chat = await this.saveChatMessage(userId, message, aiResponse);

      // Check for purchase intent
      if (this.detectPurchaseIntent(message, aiResponse)) {
        const productInfo = this.extractProductInfo(aiResponse);
        if (productInfo) {
          const paymentLink = await this.paymentService.createPaymentLink({
            amount: productInfo.priceInNaira,
            productName: productInfo.name,
            email: 'user@example.com', // Get this from user context
          });

          return {
            aiResponse,
            paymentLink,
            hasPurchaseIntent: true,
            productInfo,
            chatId: chat._id,
          };
        }
      }

      return {
        aiResponse,
        hasPurchaseIntent: false,
        chatId: chat._id,
      };
    } catch (error) {
      console.error('Chat processing error:', error);
      throw error;
    }
  }

  private async saveChatMessage(
    userId: string,
    userMessage: string,
    aiResponse: string,
  ) {
    const chat = await this.chatModel.create({
      userId,
      messages: [
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: aiResponse, timestamp: new Date() },
      ],
    });
    return chat;
  }

  private detectPurchaseIntent(
    userMessage: string,
    aiResponse: string,
  ): boolean {
    const purchaseKeywords = [
      'yes',
      'buy',
      'purchase',
      'proceed',
      'get it',
      'want it',
      'take it',
      'i will take',
      'i want',
    ];

    const userIntent = purchaseKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword),
    );

    const priceDiscussed = aiResponse.includes('₦') || aiResponse.includes('$');

    return userIntent && priceDiscussed;
  }

  private extractProductInfo(response: string) {
    for (const [product, price] of Object.entries(this.products)) {
      if (response.toLowerCase().includes(product)) {
        return {
          name: product,
          price,
          priceInNaira: price * 1500, // Using conversion rate of 1500
        };
      }
    }
    return null;
  }
}
