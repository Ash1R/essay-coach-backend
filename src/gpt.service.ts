// src/gpt/gpt.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

@Injectable()
export class GptService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateInterviewStories(profile: string): Promise<string> {
    const prompt = `
  You are a professional interview AND college essay coach helping a student surface strong behavioral interview OR college essay stories.
  
  Here is their personality profile and experience:
  ${profile}
  
  Based on this, generate 2–3 stories in STAR format. For each story include:
  
  - Title
  - Situation
  - Task
  - Action
  - Result
  - What this shows about them
  
  Use clear formatting. Keep each story under ~200 words.
  `;
  
    const chatCompletion =  await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful, concise career coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 900,
    });
  
    return chatCompletion.choices[0]?.message?.content || '';
  }
  async generateSuggestions(reflections: string): Promise<string> {
    const prompt = `
  You are a college admissions and interview coach.
  
  The user gave these simple answers to personal reflection questions:
  ${reflections}
  
  Write 5 short, friendly suggestions to help them turn these ideas into strong essays or stories. Use plain English. Each suggestion should feel encouraging and actionable.
  `;
  
    const chatCompletion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a thoughtful, encouraging coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });
  
    return chatCompletion.choices[0]?.message?.content || '';
  }
  async reviewInterviewTranscript(transcript: string): Promise<
  { phrase: string; message: string }[]
> {
  const prompt = `
You are an interview and college essay coach. The following is a transcript or draft of an interview-style response OR a college essay:

"${transcript}"

Highlight up to 10 specific words or phrases that could be improved for tone, grammar, or clarity in interviews or if its a college essay, review showing impact, emotion, and flow. For each, return:
- the exact phrase
- a short explanation why

Respond as a JSON array like:
[
  { "phrase": "I don't know", "message": "Sounds unsure — try a more confident phrase." },
  { "phrase": "basically", "message": "Too informal for an interview — consider removing." }
]
  `;

  const res = await this.openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful interview feedback bot.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 500,
  });

  try {
    return JSON.parse(res.choices[0]?.message?.content || '[]');
  } catch {
    return [];
  }
}

async generateFollowup(answer: string): Promise<string> {
  const prompt = `
You are helping a student reflect more deeply. Given this answer:
"${answer}"
Ask a thoughtful, specific follow-up question that encourages them to reflect more or give an example.
Just return the follow-up question — no extra text.`;

  const chatCompletion = await this.openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a thoughtful interviewer.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 50,
  });

  return chatCompletion.choices[0]?.message?.content || '';
}

async transcribeAudio(filePath: string): Promise<string> {
  const file = fs.createReadStream(filePath);
  const transcription = await this.openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
  });

  return transcription.text;
}


async generateEssayIdeas(reflections: string, prompt?: string): Promise<string> {
  const intro = prompt?.trim()
    ? `They are trying to answer the following prompt:\n"${prompt}"\n\n`
    : '';

  const systemPrompt = `You are a helpful college application brainstorming assistant.`;

  const userPrompt = `
${intro}Here are some quick reflections from a student:
${reflections}

Based on these, generate 4–6 unique personal essay ideas or story directions that could help them stand out. Each idea should be 1 short paragraph (2–3 sentences max) and should focus on one angle, trait, or moment.

Avoid STAR format. Do not number them. Just separate each idea with a line break.
`.trim();

  const chatCompletion = await this.openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.75,
    max_tokens: 850,
  });

  return chatCompletion.choices[0]?.message?.content || '';
}



  async compareDrafts(_: string, draft: string): Promise<string> {
    const prompt = `
  Evaluate the following response for overall quality.
  
  Provide:
  1. Strengths
  2. Weaknesses
  3. Suggestions to improve
  4. Scores (1–10) for:
     - Clarity
     - Structure
     - Voice
     - Depth of Reflection
  
  Here is the response:
  """
  ${draft}
  """
  `;
  
    const chatCompletion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful writing coach that evaluates responses across different formats.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });
  
    return chatCompletion.choices[0]?.message?.content || '';
  }
}  


