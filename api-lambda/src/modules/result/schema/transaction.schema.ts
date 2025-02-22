import { Schema } from 'dynamoose';

export const TransactionSchema = new Schema(
  {
    result_uuid: {
      type: String,
      hashKey: true,
    },
    qpay_invoice_id: String,
    amount: Number,
    status: String,
    // GSI must be
    quiz_uuid: {
      type: String,
      index: {
        name: 'quiz_uuid-index',
        type: 'global',
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
