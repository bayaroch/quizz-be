import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';
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
  ],
  providers: [ConfigService],
})
export class AppModule {}
