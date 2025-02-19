import { Body, Controller, Post } from '@nestjs/common';

import { Public } from '@modules/auth/decorators/public.decorator';
import { GoogleLoginInput } from '@modules/auth/model/google-login.input';
import { AuthService } from '@modules/auth/service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('google/login')
  googleSignIn(@Body() body: GoogleLoginInput) {
    return this.authService.signInGoogle(body);
  }
}
