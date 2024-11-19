import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enum/auth.type.enum';
import { ChatRequestDto } from './dto/chat.dto';
import { ActiveUser } from 'src/iam/authentication/decorators/ActiveUser.decorator';
import { ActiveUserDTO } from 'src/iam/authentication/dto/activeUser.dto';
@Auth(AuthType.Bearer)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @HttpCode(HttpStatus.OK)
  @Post('chat')
  async chat(
    @Body() chatRequest: ChatRequestDto,
    @ActiveUser() user: ActiveUserDTO,
  ) {
    return this.chatbotService.getChatbotResponse({
      ...chatRequest,
      userId: user.sub.toString(),
    });
  }
}
