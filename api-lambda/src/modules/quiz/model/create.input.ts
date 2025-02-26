import { IsNumber, IsString } from 'class-validator';

export class CreateQuizInput {
  @IsString()
  name: string;

  @IsString()
  data_uri: string;

  @IsString()
  quiz_identifier: string;

  @IsString()
  status: 'draft' | 'published';

  @IsString()
  user_uuid: string;

  @IsString()
  profile_image: string;

  @IsString()
  description: string;

  @IsString()
  tag: string;

  @IsNumber()
  price: number;
}
