import { Field, ID, ObjectType } from '@nestjs/graphql';

export type ResultKey = {
  result_uuid: string;
};

@ObjectType()
export class Result {
  @Field(() => ID)
  result_uuid: string;

  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field()
  phone_number: string;

  @Field()
  email: string;

  @Field()
  answer: string;

  @Field()
  result_uri: string;

  @Field()
  result_excerpt: string;

  @Field()
  quiz_uuid: string;
}
