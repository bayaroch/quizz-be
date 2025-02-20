import _ from 'lodash';
import { InjectModel, Model, TransactionSupport } from 'nestjs-dynamoose';
import { errors } from 'src/error-constants';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { User, UserKey } from '@modules/user/model/user.model';

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
}
