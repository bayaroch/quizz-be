import { Schema } from 'dynamoose';

export const QuizSchema = new Schema(
  {
    quiz_uuid: {
      type: String,
      hashKey: true,
    },
    name: String,
    data_uri: String,
    quiz_identifier: String,
    status: String,
    // GSI must be
    user_uuid: {
      type: String,
      index: {
        name: 'user_uuid-index',
        type: 'global',
      },
    },
    profile_image: String,
    description: String,
    tag: String,
    price: Number,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
