import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginInput {
  @IsNotEmpty()
  @IsString()
  google_access_token: string;
}
