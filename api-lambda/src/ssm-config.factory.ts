import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

import { Logger } from '@nestjs/common';

const loadValueFromSSM = async (name: string) => {
  const ssm = new SSMClient({ region: process.env.REGION });
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  const result = await ssm.send(command);
  return result.Parameter?.Value;
};

export const SSMConfigFactory = async () => {
  const ssmParams = [
    'QPAY_URL_PARAM',
    'QPAY_INVOICE_CODE_PARAM',
    'QPAY_CLIENT_SECRET_PARAM',
    'QPAY_CLIENT_ID_PARAM',
    'BASE_URL_PARAM',
  ];

  for (const param of ssmParams) {
    const envValue = process.env[param];
    if (envValue) {
      Logger.debug(`Loading SSM parameter: ${envValue}`);
      const ssmValue = await loadValueFromSSM(envValue);
      if (ssmValue) {
        process.env[param] = ssmValue;
        Logger.debug(`Loaded SSM parameter: ${param}`);
      }
    }
  }

  return process.env;
};
