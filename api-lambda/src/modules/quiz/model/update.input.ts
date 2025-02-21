import { IsOptional, IsString } from 'class-validator';

export class UpdateQuizInput {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  quiz_identifier: string;

  @IsOptional()
  @IsString()
  data_uri: string;

  @IsOptional()
  @IsString()
  status: 'draft' | 'published';

  @IsString()
  profile_image: string;

  @IsString()
  description: string;

  @IsString()
  tag: string;
}
