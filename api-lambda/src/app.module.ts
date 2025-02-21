import { DynamooseModule } from 'nestjs-dynamoose';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { AuthModule } from '@modules/auth/auth.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { ResultModule } from '@modules/result/result.module';
import { S3Module } from '@modules/s3/s3.module';
import { UserModule } from '@modules/user/user.module';

import { ConfigService } from './config.service';
import { SSMConfigFactory } from './ssm-config.factory';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [SSMConfigFactory],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
    }),
    DynamooseModule.forRoot({
      local: process.env.IS_DDB_LOCAL === 'true',
      aws: { region: process.env.REGION },
      table: {
        create: true,
        prefix: '',
        suffix: '',
      },
    }),
    AuthModule,
    UserModule,
    QuizModule,
    S3Module,
    ResultModule,
  ],
  providers: [ConfigService],
})
export class AppModule {}
