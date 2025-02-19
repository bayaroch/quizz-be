import { Schema } from 'dynamoose';

// User Table
export const UserSchema = new Schema(
  {
    uuid: {
      type: String,
      hashKey: true, //Primary Key
    },
    email: {
      type: String,
      required: true,
      index: {
        name: 'email-index',
        type: 'global',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    first_name: String,
    last_name: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
