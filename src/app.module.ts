import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';

@Module({
  imports: [],
  controllers: [AppController, GptController],
  providers: [AppService, GptService],
})
export class AppModule {}
