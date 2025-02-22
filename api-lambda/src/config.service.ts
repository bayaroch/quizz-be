import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get qpayClientId(): string {
    return this.getConfigString(
      'QPAY_CLIENT_ID_PARAM',
      'QPAY_CLIENT_ID',
      'QPAY_CLIENT_ID is not defined in the configuration or environment',
    );
  }

  get qpayClientSecret(): string {
    return this.getConfigString(
      'QPAY_CLIENT_SECRET_PARAM',
      'QPAY_CLIENT_SECRET',
      'QPAY_CLIENT_SECRET is not defined in the configuration or environment',
    );
  }

  get qpayInvoiceCode(): string {
    return this.getConfigString(
      'QPAY_INVOICE_CODE_PARAM',
      'QPAY_INVOICE_CODE',
      'QPAY_INVOICE_CODE is not defined in the configuration or environment',
    );
  }

  get qpayUrl(): string {
    return this.getConfigString(
      'QPAY_URL_PARAM',
      'QPAY_URL',
      'QPAY_URL is not defined in the configuration or environment',
    );
  }

  get baseURL(): string {
    return this.getConfigString(
      'BASE_URL_PARAM',
      'BASE_URL',
      'BASE_URL is not defined in the configuration or environment',
    );
  }

  get googleClientId(): string {
    return this.getConfigString(
      'GOOGLE_CLIENT_ID_PARAM',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_ID is not defined in the configuration or environment',
    );
  }

  get googleClientSecret(): string {
    return this.getConfigString(
      'GOOGLE_CLIENT_SECRET_PARAM',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CLIENT_SECRET is not defined in the configuration or environment',
    );
  }

  get awsRegion(): string {
    return this.getConfigString(
      'AWS_REGION_PARAM',
      'AWS_REGION',
      'AWS_REGION is not defined in the configuration or environment',
    );
  }

  private getConfigString(
    configKey: string,
    envKey: string,
    errorMessage: string,
  ): string {
    // First, try to get the value from the configuration service
    let value = this.configService.get<string>(configKey);

    // If not found in the configuration service, try the environment variable
    if (!value) {
      value = process.env[envKey];
    }

    // If still not found, throw an error
    if (!value) {
      throw new Error(errorMessage);
    }

    return value;
  }
}
