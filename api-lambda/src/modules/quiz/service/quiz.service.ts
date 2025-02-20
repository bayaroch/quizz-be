import { InjectModel, Model } from 'nestjs-dynamoose';
import { errors } from 'src/error-constants';
import * as uuid from 'uuid';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Quiz, QuizKey } from '@modules/quiz/model/quiz.model';

import { CreateQuizInput } from '../model/create.input';
import { UpdateQuizInput } from '../model/update.input';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('quiz-stack-dev-main-quiz-table')
    private readonly quizModel: Model<Quiz, QuizKey>,
  ) {}

  async create(createQuizInput: CreateQuizInput): Promise<{ data: Quiz }> {
    try {
      const params = {
        quiz_uuid: uuid.v4(),
        name: createQuizInput.name,
        data_uri: createQuizInput.data_uri,
        status: createQuizInput.status,
        user_uuid: createQuizInput.user_uuid,
        profile_image: createQuizInput.profile_image,
        description: createQuizInput.description,
        tag: createQuizInput.tag,
      };

      const newQuiz = await this.quizModel.create(params);
      return {
        data: newQuiz,
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

  async findAll(
    limit: number,
    lastKey?: string,
  ): Promise<{
    data: Quiz[];
    meta: {
      last_key: string | null;
      total_count: number;
    };
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
        let scanOperation = this.quizModel.scan().limit(parsedLimit);

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
                ...errors.quiz_model_related_error,
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
              ...errors.quiz_model_related_error,
              message: 'Invalid data type in scan parameters',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        throw new HttpException(
          {
            ...errors.quiz_model_related_error,
            message: 'Error executing scan operation',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Safely convert results to JSON
      let items: Quiz[] = [];

      try {
        // @ts-expect-error - dynamoose type definition issue
        items = result.toJSON();
      } catch (jsonError) {
        console.error('JSON conversion error:', jsonError);
        throw new HttpException(
          {
            ...errors.quiz_model_related_error,
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

      return {
        data: items,
        meta: {
          last_key: encodedLastKey,
          total_count: items.length,
        },
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

  async findOne(quiz_id: string): Promise<{ data: Quiz }> {
    try {
      const result = await this.quizModel.query('quiz_uuid').eq(quiz_id).exec();

      if (result.length <= 0) {
        throw new HttpException(errors.not_found, HttpStatus.NOT_FOUND);
      }

      return {
        data: result[0],
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

  async update(
    quizId: string,
    updateQuizInput: UpdateQuizInput,
  ): Promise<{ data: Quiz }> {
    try {
      const updateParams: Partial<Quiz> = {};

      // Only add fields to updateParams if they are provided in updateQuizInput
      if (updateQuizInput.name !== undefined) {
        updateParams.name = updateQuizInput.name;
      }
      if (updateQuizInput.data_uri !== undefined) {
        updateParams.data_uri = updateQuizInput.data_uri;
      }
      if (updateQuizInput.status !== undefined) {
        updateParams.status = updateQuizInput.status;
      }
      if (updateQuizInput.profile_image !== undefined) {
        updateParams.profile_image = updateQuizInput.profile_image;
      }
      if (updateQuizInput.description !== undefined) {
        updateParams.description = updateQuizInput.description;
      }
      if (updateQuizInput.tag !== undefined) {
        updateParams.tag = updateQuizInput.tag;
      }

      const existingItem = await this.quizModel
        .query('quiz_uuid')
        .eq(quizId)
        .exec();

      if (existingItem.length <= 0) {
        throw new HttpException(errors.not_found, HttpStatus.NOT_FOUND);
      }

      const updatedQuiz = await this.quizModel.update(
        { quiz_uuid: quizId },
        updateParams,
      );

      return {
        data: updatedQuiz,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        errors.not_received,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async remove(quizId: string): Promise<void> {
    try {
      const existingItem = await this.quizModel
        .query('quiz_uuid')
        .eq(quizId)
        .exec();

      if (existingItem.length <= 0) {
        throw new HttpException(errors.not_found, HttpStatus.NOT_FOUND);
      }

      await this.quizModel.delete({
        quiz_uuid: quizId,
      });
    } catch (error: any) {
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
