import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: Array })
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: Object, default: null })
  paymentInfo?: {
    product: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    paymentLink?: string;
  };
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
