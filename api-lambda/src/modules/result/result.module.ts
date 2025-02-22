import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from 'src/config.service';

import { Module } from '@nestjs/common';

import { QuizSchema } from '@modules/quiz/schema/quiz.schema';
import { QuizService } from '@modules/quiz/service/quiz.service';

import { ResultController } from './controller/result.controller';
import { ResultSchema } from './schema/result.schema';
import { TransactionSchema } from './schema/transaction.schema';
import { QpayService } from './service/qpay.service';
import { ResultService } from './service/result.service';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'quiz-stack-dev-main-result-table',
        schema: ResultSchema,
        options: {
          create: true,
          waitForActive: true,
        },
      },
      {
        name: 'quiz-stack-dev-main-transaction-table',
        schema: TransactionSchema,
        options: {
          create: true,
          waitForActive: true,
        },
      },
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
  controllers: [ResultController],
  providers: [ResultService, QpayService, QuizService, ConfigService],
  exports: [ResultService],
})
export class ResultModule {}
