import { Field, ID, ObjectType } from '@nestjs/graphql';

export type QuizKey = {
  quiz_uuid: string;
};

@ObjectType()
export class Quiz {
  @Field(() => ID)
  quiz_uuid: string;

  @Field()
  name: string;

  @Field()
  quiz_identifier: string;

  @Field()
  data_uri: string;

  @Field()
  status: string;

  @Field()
  user_uuid: string;

  @Field()
  profile_image: string;

  @Field()
  description: string;

  @Field()
  tag: string;
}
