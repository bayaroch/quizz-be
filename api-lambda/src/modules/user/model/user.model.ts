import { Field, ID, ObjectType } from '@nestjs/graphql';

export type UserKey = {
  uuid: string;
};

@ObjectType()
export class User {
  @Field(() => ID)
  uuid: string;

  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field()
  email: string;

  @Field(() => String, { defaultValue: 'user' })
  role: string;

  @Field()
  status: string;

  @Field()
  created_at: string;

  @Field()
  updated_at: string;
}
