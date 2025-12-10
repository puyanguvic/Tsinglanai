import { Injectable } from '@nestjs/common';

@Injectable()
export class AiAssistantService {
  async summarize(content: string) {
    // Placeholder: plug in Gemini or local LLM
    return `AI summary: ${content.slice(0, 60)}...`;
  }
}
