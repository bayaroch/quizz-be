import { Field, ID, ObjectType } from '@nestjs/graphql';

export type TransactionKey = {
  result_uuid: string;
};

@ObjectType()
export class Transaction {
  @Field(() => ID)
  result_uuid: string;

  @Field()
  status: string;

  @Field()
  qpay_invoice_id: string;

  @Field()
  amount: number;

  @Field()
  quiz_uuid: string;
}
