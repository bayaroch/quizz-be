import _ from 'lodash';
import { InjectModel, Model, TransactionSupport } from 'nestjs-dynamoose';
import { errors } from 'src/error-constants';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { User, UserKey } from '@modules/user/model/user.model';

import { UserInput } from '../model/user-input';

@Injectable()
export class UserService extends TransactionSupport {
  constructor(
    @InjectModel('quiz-stack-dev-main-user-table')
    private readonly userModel: Model<User, UserKey>,
  ) {
    super();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.userModel
        .query('email')
        .eq(email)
        .using('email-index')
        .exec();

      if (result.length > 0) {
        return result[0];
      } else {
        return null;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      return null;
    }
  }

  async getTokenPayload(id: string): Promise<Partial<User>> {
    const existingUser = await this.userModel.query('uuid').eq(id).exec();
    if (!existingUser) {
      throw new HttpException(errors.not_found, HttpStatus.NOT_FOUND);
    }

    // Destructure only the needed fields
    const { uuid, email, role } = existingUser[0];

    return { uuid, email, role };
  }

  async createUser(userData: any): Promise<User> {
    try {
      const newUser = await this.userModel.create(userData);
      return newUser;
    } catch (error: any) {
      console.log(error);
      throw new HttpException(
        {
          ...errors.user_model_related_error,
          message: 'newUser: userModel',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async updateUser(
    userId: string,
    updateUserInput: Partial<User>,
  ): Promise<User> {
    try {
      const updateParams: Partial<User> = {};

      // Only add fields to updateParams if they are provided in updateUserInput
      if (updateUserInput.first_name !== undefined) {
        updateParams.first_name = updateUserInput.first_name;
      }
      if (updateUserInput.last_name !== undefined) {
        updateParams.last_name = updateUserInput.last_name;
      }
      if (updateUserInput.role !== undefined) {
        updateParams.role = updateUserInput.role;
      }
      if (updateUserInput.email !== undefined) {
        updateParams.email = updateUserInput.email;
      }

      const existingUser = await this.userModel.query('uuid').eq(userId).exec();
      if (existingUser.length <= 0) {
        throw new HttpException(errors.not_found, HttpStatus.NOT_FOUND);
      }

      if (_.isEmpty(updateParams)) {
        throw new HttpException(
          errors.no_update_parameters_provided,
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedUser = await this.userModel.update(
        { uuid: userId },
        updateParams,
      );
      return updatedUser;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      throw new HttpException(
        {
          ...errors.user_model_related_error,
          message: 'updatedUser: userModel',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async getExistingUser(userId: string): Promise<User> {
    const existingUserItem = await this.userModel
      .query('uuid')
      .eq(userId)
      .exec();
    if (existingUserItem.length <= 0) {
      throw new HttpException(errors.not_found, HttpStatus.NOT_FOUND);
    }
    return existingUserItem[0];
  }

  async getAppInit(currentUser: UserInput): Promise<{ user_info: User }> {
    const existingUser = await this.getExistingUser(currentUser.uuid);
    return {
      user_info: existingUser,
    };
  }

  // user list
  async findAll(
    limit: number,
    lastKey?: string,
  ): Promise<{
    data: User[];
  }> {
    try {
      // Validate and parse limit
      const parsedLimit = parseInt(limit as any, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new HttpException(
          errors.limit_must_be_greater_than_or_equal_to_1,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      let result;
      try {
        let scanOperation = this.userModel.scan().limit(parsedLimit);

        // Handle pagination with proper error handling for lastKey
        if (lastKey) {
          try {
            const decodedKey = Buffer.from(lastKey, 'base64').toString('ascii');
            console.log('decodedKey', decodedKey);
            const startKey = JSON.parse(decodedKey);

            // Validate the startKey structure
            if (startKey && typeof startKey === 'object') {
              scanOperation = scanOperation.startAt(startKey);
            } else {
              throw new Error('Invalid lastKey format');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (parseError: any) {
            throw new HttpException(
              {
                ...errors.user_model_related_error,
                message: 'Invalid lastKey format',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        result = await scanOperation.exec();
      } catch (error: any) {
        console.error('Query operation error:', error);

        // Check for specific DynamoDB errors
        if (error.name === 'SerializationException') {
          throw new HttpException(
            {
              ...errors.user_model_related_error,
              message: 'Invalid data type in scan parameters',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        throw new HttpException(
          {
            ...errors.user_model_related_error,
            message: 'Error executing scan operation',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Safely convert results to JSON
      let items: User[] = [];

      try {
        // @ts-expect-error - dynamoose type definition issue
        items = result.toJSON();
      } catch (jsonError) {
        console.error('JSON conversion error:', jsonError);
        throw new HttpException(
          {
            ...errors.user_model_related_error,
            message: 'Error converting scan results',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Generate lastKey safely
      let encodedLastKey: string | null = null;
      if (result.lastKey) {
        try {
          encodedLastKey = Buffer.from(JSON.stringify(result.lastKey)).toString(
            'base64',
          );
        } catch (encodeError) {
          console.error('LastKey encoding error:', encodeError);
        }
      }
      console.log('encodedLastKey', encodedLastKey);

      return {
        data: items,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        errors.not_received,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
