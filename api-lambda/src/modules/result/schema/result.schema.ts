import { Schema } from 'dynamoose';

export const ResultSchema = new Schema(
  {
    result_uuid: {
      type: String,
      hashKey: true,
    },
    first_name: String,
    last_name: String,
    phone_number: String,
    email: String,
    answer: String,
    // beginning section of result for free
    result_uri: String,
    result_excerpt: String,
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
