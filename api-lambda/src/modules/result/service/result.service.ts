import { InjectModel, Model } from 'nestjs-dynamoose';
import { errors } from 'src/error-constants';
import * as uuid from 'uuid';

import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';

import { QuizService } from '@modules/quiz/service/quiz.service';
import { Result, ResultKey } from '@modules/result/model/result.model';

import { HandlerService } from '../handler/index.handler';
import { CreateInvoiceInput } from '../model/create-invoice.input';
import { CreateResultInput } from '../model/create.input';
import { Transaction, TransactionKey } from '../model/transaction.model';
import { QpayService } from './qpay.service';

export interface QpayResponse {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  urls: {
    name: string;
    description: string;
    link: string;
  }[];
}

@Injectable()
export class ResultService {
  // pending -> qpay invoice created
  static readonly TRANSACTION_STATUS_PENDING = 'pending';
  // paid -> qpay invoice paid
  static readonly TRANSACTION_STATUS_PAID = 'paid';

  constructor(
    @InjectModel('quiz-stack-dev-main-result-table')
    private readonly resultModel: Model<Result, ResultKey>,
    @InjectModel('quiz-stack-dev-main-transaction-table')
    private readonly transactionModel: Model<Transaction, TransactionKey>,
    private quizService: QuizService,
    @Inject(forwardRef(() => QpayService))
    private qpayService: QpayService,
  ) {}

  async create(
    createResultInput: CreateResultInput,
  ): Promise<{ data: Omit<Result, 'answer'> }> {
    try {
      const handlerService = new HandlerService();
      await handlerService.process('processGymHandler');

      // TODO first process works then save to table
      const result_uri = '';
      const result_experpt = '';

      const params = {
        result_uuid: uuid.v4(),
        first_name: createResultInput.first_name,
        last_name: createResultInput.last_name,
        phone_number: createResultInput.phone_number,
        email: createResultInput.email,
        answer: createResultInput.answer,
        result_uri: result_uri,
        result_excerpt: result_experpt,
        quiz_uuid: createResultInput.quiz_uuid,
      };

      const newResult = await this.resultModel.create(params);

      return {
        data: newResult,
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
    data: Result[];
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
        let scanOperation = this.resultModel.scan().limit(parsedLimit);

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
                ...errors.result_model_related_error,
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
              ...errors.result_model_related_error,
              message: 'Invalid data type in scan parameters',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        throw new HttpException(
          {
            ...errors.result_model_related_error,
            message: 'Error executing scan operation',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Safely convert results to JSON
      let items: Result[] = [];

      try {
        // @ts-expect-error - dynamoose type definition issue
        items = result.toJSON();
      } catch (jsonError) {
        console.error('JSON conversion error:', jsonError);
        throw new HttpException(
          {
            ...errors.result_model_related_error,
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

  async findOne(result_id: string): Promise<{ data: Result }> {
    try {
      const result = await this.resultModel
        .query('result_uuid')
        .eq(result_id)
        .exec();

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

  async createInvoice(
    createInvoiceInput: CreateInvoiceInput,
  ): Promise<{ data: QpayResponse }> {
    try {
      const { result_id: resultId } = createInvoiceInput;
      const { data: currentResult } = await this.findOne(resultId);

      const { data: currentQuiz } = await this.quizService.findOne(
        currentResult.quiz_uuid,
      );

      const qpayResult = await this.qpayService.process_transaction_payment(
        currentResult.result_uuid,
        currentQuiz.name,
        currentQuiz.price,
      );

      await this.transactionModel.create({
        result_uuid: resultId,
        status: 'pending',
        quiz_uuid: currentResult.quiz_uuid,
        qpay_invoice_id: qpayResult.invoice_id,
        amount: currentQuiz.price,
      });

      return {
        data: qpayResult,
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

  async updateTransactionStatus(resultId: string): Promise<void> {
    try {
      const currentTransaction = await this.transactionModel
        .query('result_uuid')
        .eq(resultId)
        .exec();

      if (currentTransaction.length <= 0) {
        throw new HttpException(errors.not_found, HttpStatus.NOT_FOUND);
      }

      await this.transactionModel.update(
        {
          result_uuid: resultId,
        },
        {
          status: 'paid',
        },
      );
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

  // Transaction List
  async findAllTransaction(
    limit: number,
    lastKey?: string,
  ): Promise<{
    data: Transaction[];
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
        let scanOperation = this.transactionModel.scan().limit(parsedLimit);

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
                ...errors.transaction_model_related_error,
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
              ...errors.transaction_model_related_error,
              message: 'Invalid data type in scan parameters',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        throw new HttpException(
          {
            ...errors.transaction_model_related_error,
            message: 'Error executing scan operation',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Safely convert results to JSON
      let items: Transaction[] = [];

      try {
        // @ts-expect-error - dynamoose type definition issue
        items = result.toJSON();
      } catch (jsonError) {
        console.error('JSON conversion error:', jsonError);
        throw new HttpException(
          {
            ...errors.transaction_model_related_error,
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

  async getTransactionDetail(resultId: string): Promise<{ data: Transaction }> {
    try {
      const result = await this.transactionModel
        .query('result_id')
        .eq(resultId)
        .exec();

      if (result.length <= 0) {
        throw new HttpException(errors.not_found, HttpStatus.NOT_FOUND);
      }

      return {
        data: result[0],
      };
    } catch (error: any) {
      throw new HttpException(
        errors.not_received,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
