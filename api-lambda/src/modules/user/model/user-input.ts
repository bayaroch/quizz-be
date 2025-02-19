import { IsString } from 'class-validator';

export class UserInput {
  @IsString()
  uuid: string;
}
