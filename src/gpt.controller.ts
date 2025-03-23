// src/gpt.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { GptService } from './gpt.service';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';



@Controller('api')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('ideas')
  async generateIdeas(@Body() body: { profile: string }) {
    const ideas = await this.gptService.generateEssayIdeas(body.profile);
    return { ideas };
  }

  

@Post('transcribe-audio')
@UseInterceptors(FileInterceptor('audio', {
  storage: diskStorage({ destination: './uploads', filename: (req, file, cb) => cb(null, file.originalname) }),
}))


  @Post('stories')
async getStories(@Body() body: { profile: string }) {
  return {
    stories: await this.gptService.generateInterviewStories(body.profile),
  };
}
@Post('followup')
async generateFollowup(@Body() body: { answer: string }) {
  const followup = await this.gptService.generateFollowup(body.answer);
  return { followup };
}
@Post('interview-review')
async reviewTranscript(@Body() body: { transcript: string }) {
  return {
    highlights: await this.gptService.reviewInterviewTranscript(body.transcript),
  };
}
@Post('suggestions')
async getSuggestions(@Body() body: { reflections: string, prompt?: string }) {
  return {
    suggestions: await this.gptService.generateEssayIdeas(body.reflections, body.prompt),
  };
}


  @Post('compare-drafts')
  async compareDrafts(
    @Body() body: { oldDraft: string; newDraft: string }
  ) {
    const feedback = await this.gptService.compareDrafts(
      body.oldDraft,
      body.newDraft
    );
    return { feedback };
  }
}
