import { DynamooseModule } from 'nestjs-dynamoose';

import { Module } from '@nestjs/common';

import { QuizController } from './controller/quiz.controller';
import { QuizSchema } from './schema/quiz.schema';
import { QuizService } from './service/quiz.service';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'quiz-stack-dev-main-quiz-table',
        schema: QuizSchema,
        options: {
          create: true,
          waitForActive: true,
        },
      },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
