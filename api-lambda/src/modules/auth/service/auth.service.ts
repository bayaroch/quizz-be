import { OAuth2Client } from 'google-auth-library';
import { errors } from 'src/error-constants';
import * as uuid from 'uuid';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/user/model/user.model';
import { UserService } from '@modules/user/service/user.service';

import { GoogleLoginInput } from '@modules/auth/model/google-login.input';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // Login/SignUp
  async signInGoogle(body: GoogleLoginInput): Promise<{
    access_token: string;
  }> {
    const google_access_token = body.google_access_token;
    try {
      // check oauth
      // get user data
      const googleData = await this.authenticateWithGoogle(google_access_token);

      console.log('google data', googleData);

      // check email
      const existingUser = await this.userService.findUserByEmail(
        googleData.email,
      );

      console.log('existingUser', existingUser);

      let tokenPayload: Partial<User> = {};

      if (!existingUser) {
        // Create User
        const newUuid = uuid.v4();
        const userDataToCreate = {
          uuid: newUuid,
          email: googleData.email,
          role: 'user',
          first_name: googleData.given_name || 'noname',
          last_name: googleData.family_name || 'noname',
          status: 'active',
        };

        await this.userService.createUser(userDataToCreate);

        tokenPayload = await this.userService.getTokenPayload(newUuid);
      } else {
        // Update User
        const userDataToUpdate = {
          email: googleData.email,
          role: 'user',
          first_name: googleData.given_name || 'noname',
          last_name: googleData.family_name || 'noname',
        };

        await this.userService.updateUser(existingUser.uuid, userDataToUpdate);
        tokenPayload = await this.userService.getTokenPayload(
          existingUser.uuid,
        );
      }

      return {
        access_token: await this.jwtService.signAsync(tokenPayload),
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(errors.unauthorized, HttpStatus.UNAUTHORIZED);
    }
  }

  // Private methods
  private async authenticateWithGoogle(token: string): Promise<any> {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      return payload;
    } catch (error: any) {
      throw new HttpException(
        { ...errors.google_api, message: error.message },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
