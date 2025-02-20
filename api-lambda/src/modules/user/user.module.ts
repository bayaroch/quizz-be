import { DynamooseModule } from 'nestjs-dynamoose';

// import { ConfigService } from 'src/config.service';
import { Module } from '@nestjs/common';

import { UserResolver } from '@modules/user/resolver/user.resolver';
import { UserSchema } from '@modules/user/schema/user.schema';
import { UserService } from '@modules/user/service/user.service';

import { UserController } from './controller/user.controller';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'quiz-stack-dev-main-user-table',
        schema: UserSchema,
        options: {
          create: true,
          waitForActive: true,
        },
      },
    ]),
  ],
  providers: [UserService, UserResolver /*QpayService, ConfigService*/],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
