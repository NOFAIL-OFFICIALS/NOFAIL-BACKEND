export class ChatMessageDto {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

export class PaymentInfoDto {
  amount: number;
  productName: string;
  currency?: string;
}
