// src/gpt/gpt.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GptService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateEssayIdeas(profile: string): Promise<string> {
    const prompt = `The student shared the following:\n\n${profile}\n\nSuggest 2–3 college essay ideas with hooks and values.`;

    const chatCompletion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful college essay coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 700,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  }

  async compareDrafts(oldDraft: string, newDraft: string): Promise<string> {
    const prompt = `Compare these two drafts and provide feedback:
[OLD]
${oldDraft}
[NEW]
${newDraft}

1. What improved?
2. What regressed?
3. Suggestions to improve
4. Score both on Voice, Clarity, Structure, Reflection (1–10)`;

    const chatCompletion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful college essay reviewer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  }
}
