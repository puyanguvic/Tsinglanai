import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('ai-assistant')
@UseGuards(JwtGuard)
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Post('summarize')
  summarize(@Body('content') content: string) {
    return this.aiAssistantService.summarize(content);
  }
}
