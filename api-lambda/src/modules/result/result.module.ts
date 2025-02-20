import { DynamooseModule } from 'nestjs-dynamoose';

import { Module } from '@nestjs/common';

import { ResultController } from './controller/result.controller';
import { ResultSchema } from './schema/result.schema';
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
    ]),
  ],
  controllers: [ResultController],
  providers: [ResultService],
  exports: [ResultService],
})
export class ResultModule {}
