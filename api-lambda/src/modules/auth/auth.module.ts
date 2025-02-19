// import { ConfigService } from 'src/config.service';

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '@modules/user/user.module';
import { AuthGuard } from '@modules/auth/auth.guard';
import { jwtConstants } from '@modules/auth/constants';
import { AuthController } from '@modules/auth/controller/auth.controller';
import { AuthService } from '@modules/auth/service/auth.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '86400s' },
    }),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // ConfigService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
