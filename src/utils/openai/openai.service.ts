import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  private readonly DOLLAR_TO_NAIRA_RATE = 1500;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      dangerouslyAllowBrowser: true,
    });
  }

  private getSystemPrompt(): string {
    return `You are NoFailBot, a friendly and knowledgeable customer support chatbot for NoFail, designed to assist small businesses in Nigeria.

    Available Products and Prices (in USD):
    Electronics:
    - HP Laptop: $250000
    - Dell Laptop: $220000
    - Lenovo Laptop: $150000
    - MacBook Pro: $1241
    - iPhone 14 Pro: $1499
    - Samsung Odyssey: $1999

    Accessories:
    - Keyboard: $215
    - AirPods Pro: $249
    - Logitech Superlight: $500

    Instructions:
    1. Always ask about budget before recommending products
    2. Convert USD prices to Naira using rate: 1 USD = ${this.DOLLAR_TO_NAIRA_RATE} NGN
    3. If unsure, direct users to support@techfists.com
    4. End responses with a helpful closing question
    5. When user wants to purchase, mention payment processing
    6. After payment, mention receipt generation`;
  }

  async chatWithBot(
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
  ) {
    try {
      const messages = [
        { role: 'system', content: this.getSystemPrompt() },
        ...conversationHistory,
        { role: 'user', content: message },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return 'I apologize, but I am experiencing technical difficulties. Please contact support@techfists.com for assistance.';
    }
  }
}
