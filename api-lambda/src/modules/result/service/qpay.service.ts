import axios, { AxiosResponse } from 'axios';
import { ConfigService } from 'src/config.service';

import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { Transaction } from '../model/transaction.model';
import { ResultService } from './result.service';

export interface PaymentStatusResponse {
  is_success: boolean;
  transaction?: Transaction;
  qpay?: any;
}

@Injectable()
export class QpayService {
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => ResultService))
    private resultService: ResultService,
  ) {}

  async process_transaction_payment(
    resultId: string,
    quizName: string,
    finalAmount: number,
  ): Promise<{
    invoice_id: string;
    qr_text: string;
    qr_image: string;
    urls: {
      name: string;
      description: string;
      link: string;
    }[];
  }> {
    const token = await this.getToken();
    let responseData = [];

    if (token) {
      const tokenUrl = `${this.configService.qpayUrl}/invoice`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const body = {
        invoice_code: this.configService.qpayInvoiceCode,
        sender_invoice_no: resultId,
        invoice_receiver_code: 'terminal',
        invoice_description: `${quizName}`,
        amount: finalAmount,
        callback_url: `${this.configService.baseURL}/result/qpay/payments?result_id=${resultId}`,
      };

      try {
        const response = await axios.post(tokenUrl, body, {
          headers,
        });

        responseData = response.data;

        if (responseData.error) {
          throw new Error('Something went wrong with qpay');
        }

        return {
          invoice_id: responseData.invoice_id,
          qr_text: responseData.qr_text,
          qr_image: responseData.qr_image,
          urls: responseData.urls,
        };
      } catch (error) {
        console.error('Error creating QPay payment:', error);
        throw new Error('Something went wrong');
      }
    } else {
      throw new Error('Something went wrong');
    }
  }

  async checkPaymentStatus(resultId: string): Promise<PaymentStatusResponse> {
    try {
      if (!resultId || typeof resultId !== 'string') {
        throw new Error('Invalid result ID');
      }

      const { data: transactionDetail } =
        await this.resultService.getTransactionDetail(resultId);

      if (transactionDetail.status === ResultService.TRANSACTION_STATUS_PAID) {
        return { is_success: true, transaction: transactionDetail };
      }

      const { qpay_invoice_id: invoiceId, amount: amount } = transactionDetail;

      if (!invoiceId) {
        return { is_success: false };
      }

      const token = await this.getToken();
      const response = await this.checkPayment(token, invoiceId);
      const responseData = response.data;

      if (this.isPaymentSuccessful(responseData, amount)) {
        return {
          is_success: true,
          transaction: transactionDetail,
          qpay: responseData,
        };
      }

      if (responseData.error && responseData.error === 'NO_CREDENTIALS') {
        const newToken = await this.getToken();
        if (newToken) {
          const responseCheck = await this.checkPayment(newToken, invoiceId);
          const responseDataCheck = responseCheck.data;
          if (this.isPaymentSuccessful(responseDataCheck, amount)) {
            return {
              is_success: true,
              transaction: transactionDetail,
              qpay: responseDataCheck,
            };
          }
        }
      }

      // Default return for unsuccessful payment
      return { is_success: false };
    } catch (error) {
      console.error('Error in checkPaymentStatus:', error);
      return { is_success: false };
    }
  }

  private async getToken(): Promise<string> {
    const tokenUrl = `${this.configService.qpayUrl}/auth/token`;
    console.log('tokenUrl', tokenUrl);
    try {
      const response: AxiosResponse = await axios.post(tokenUrl, null, {
        auth: {
          username: this.configService.qpayClientId,
          password: this.configService.qpayClientSecret,
        },
      });

      const responseData = response.data;

      if (responseData.error) {
        return '';
      }

      return responseData.access_token;
    } catch (error) {
      console.error('Error getting QPay token:', error);
      return '';
    }
  }

  private isPaymentSuccessful(responseData: any, amount: number): boolean {
    // Ensure amount is a valid number
    const expectedAmount = amount;
    if (isNaN(expectedAmount)) {
      console.error('Invalid amount provided');
      return false;
    }

    // Check if paid_amount exists and is a valid number
    const paidAmount = responseData.paid_amount
      ? parseInt(responseData.paid_amount, 10)
      : 0;
    if (responseData.paid_amount && isNaN(paidAmount)) {
      console.error('Invalid paid_amount in response');
      return false;
    }

    // Perform the checks
    return (
      paidAmount >= expectedAmount &&
      responseData.count > 0 &&
      responseData.rows.length > 0
    );
  }

  private async checkPayment(token: string, invoiceId: string): Promise<any> {
    const checkUrl = `${this.configService.qpayUrl}/payment/check`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const body = {
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    };

    try {
      const response: AxiosResponse = await axios.post(checkUrl, body, {
        headers,
      });

      return response;
    } catch (error) {
      console.error('Error checking QPay payment:', error);
      throw error;
    }
  }
}
