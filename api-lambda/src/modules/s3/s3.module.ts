import { ConfigService } from 'src/config.service';

import { Module } from '@nestjs/common';

import { S3Controller } from './controller/s3.controller';
import { S3Service } from './service/s3.service';

@Module({
  imports: [],
  controllers: [S3Controller],
  providers: [S3Service, ConfigService],
  exports: [S3Service],
})
export class S3Module {}
