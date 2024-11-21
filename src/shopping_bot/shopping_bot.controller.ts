import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ActiveUser } from '../iam/authentication/decorators/ActiveUser.decorator';
import { ActiveUserDTO } from '../iam/authentication/dto/activeUser.dto';
import { ChatService } from './shopping_bot.service';
import { ChatMessageDto } from './dto/chat.dto';
import { AuthType } from 'src/iam/authentication/enum/auth.type.enum';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';

@Controller('chat')
@Auth(AuthType.Bearer)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body() chatMessageDto: ChatMessageDto,
    @ActiveUser() user: ActiveUserDTO,
  ) {
    return this.chatService.processMessage(
      user.sub.toString(),
      chatMessageDto.message,
      chatMessageDto.conversationHistory,
    );
  }
}
