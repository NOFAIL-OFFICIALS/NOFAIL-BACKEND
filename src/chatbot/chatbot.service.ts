import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ChatRequestDto } from './dto/chat.dto';

export const importDynamic = new Function(
  'modulePath',
  'return import(modulePath)',
);

interface ChatContext {
  userId: string;
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

@Injectable()
export class ChatbotService implements OnModuleInit {
  private readonly logger = new Logger(ChatbotService.name);

  private gradioClient: any;
  private chatContexts: Map<string, ChatContext> = new Map();

  async onModuleInit() {
    // Initialize client when service starts
    await this.initializeClient();
  }

  private async initializeClient() {
    try {
      const { client } = await importDynamic('@gradio/client');
      this.gradioClient = await client('yemisi/nofail_chatbot');
    } catch (error) {
      this.logger.error('Failed to initialize Gradio client:', error.stack);
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Chatbot service is currently unavailable',
        data: null,
        error: 'Failed to initialize chat service',
      });
    }
  }

  private getContext(userId: string): ChatContext {
    if (!userId) {
      throw new BadRequestException({
        status: 'error',
        message: 'User ID is required',
        error: 'Missing user ID',
      });
    }

    if (!this.chatContexts.has(userId)) {
      this.chatContexts.set(userId, {
        userId,
        conversation: [],
      });
    }
    return this.chatContexts.get(userId)!;
  }

  private updateContext(userId: string, message: string, response: string) {
    try {
      const context = this.getContext(userId);
      context.conversation.push(
        {
          role: 'user',
          content: message,
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      );

      // Keep only last N messages for context
      if (context.conversation.length > 10) {
        context.conversation = context.conversation.slice(-10);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update context for user ${userId}:`,
        error.stack,
      );
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to update conversation context',
        error: 'Context update failed',
      });
    }
  }

  private buildSystemMessage(userId: string): string {
    try {
      const context = this.getContext(userId);
      const recentConversation = context.conversation
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      return `You are a NOFAIL Customer Support Chatbot.
Previous conversation:
${recentConversation}`;
    } catch (error) {
      this.logger.error(
        `Failed to build system message for user ${userId}:`,
        error.stack,
      );
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to build conversation context',
        error: 'System message generation failed',
      });
    }
  }

  async getChatbotResponse(params: ChatRequestDto & { userId: string }) {
    try {
      if (!this.gradioClient) {
        throw new ServiceUnavailableException({
          status: 'error',
          message: 'Chatbot service is not initialized',
          error: 'Service unavailable',
        });
      }

      if (!params.message?.trim()) {
        throw new BadRequestException({
          status: 'error',
          message: 'Message cannot be empty',
          error: 'Invalid input',
        });
      }

      const systemMessage = this.buildSystemMessage(params.userId);

      const result = await this.gradioClient.predict('/chat', {
        message: params.message,
        system_message: systemMessage,
        max_tokens: params.max_tokens || 512,
        temperature: params.temperature || 0.7,
        top_p: params.top_p || 0.95,
      });
      if (!result?.data) {
        throw new InternalServerErrorException({
          status: 'error',
          message: 'Invalid response from chatbot',
          error: 'Invalid response format',
        });
      }

      // Update context with new conversation
      this.updateContext(params.userId, params.message, result.data);

      return {
        status: 'success',
        message: 'Chat response generated successfully',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Chatbot response error:', error.stack);

      if (error.status === 503) {
        throw new ServiceUnavailableException({
          status: 'error',
          message: 'Chatbot service is temporarily unavailable',
          error: 'Service unavailable',
        });
      }

      if (error.status === 400) {
        throw new BadRequestException({
          status: 'error',
          message: 'Invalid request parameters',
          error: error.message,
        });
      }

      throw new InternalServerErrorException({
        status: 'error',
        message: 'An unexpected error occurred',
        error: 'Internal server error',
      });
    }
  }

  private validateTokens(tokens?: number): number {
    if (tokens && (tokens < 1 || tokens > 2048)) {
      throw new BadRequestException({
        status: 'error',
        message: 'max_tokens must be between 1 and 2048',
        error: 'Invalid token count',
      });
    }
    return tokens || 512;
  }

  private validateTemperature(temp?: number): number {
    if (temp && (temp < 0 || temp > 1)) {
      throw new BadRequestException({
        status: 'error',
        message: 'temperature must be between 0 and 1',
        error: 'Invalid temperature',
      });
    }
    return temp || 0.7;
  }

  private validateTopP(topP?: number): number {
    if (topP && (topP < 0 || topP > 1)) {
      throw new BadRequestException({
        status: 'error',
        message: 'top_p must be between 0 and 1',
        error: 'Invalid top_p value',
      });
    }
    return topP || 0.95;
  }

  // Optional: Clean up old contexts periodically
  private cleanupOldContexts() {
    const ONE_HOUR = 60 * 60 * 1000;
    for (const [userId, context] of this.chatContexts.entries()) {
      const lastMessage = context.conversation[context.conversation.length - 1];
      if (
        lastMessage &&
        Date.now() - lastMessage.timestamp.getTime() > ONE_HOUR
      ) {
        this.chatContexts.delete(userId);
      }
    }
  }
}
