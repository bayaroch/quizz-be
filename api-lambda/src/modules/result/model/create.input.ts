import { IsString } from 'class-validator';

export class CreateResultInput {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  email: string;

  @IsString()
  answer: string;

  @IsString()
  quiz_uuid: string;
}
