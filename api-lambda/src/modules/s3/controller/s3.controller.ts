import { Controller, Get, Query } from '@nestjs/common';

import { S3Service } from '@modules/s3/service/s3.service';

@Controller('upload')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get('presigned-url')
  async getPresignedUrl(
    @Query('fileName') fileName: string,
    @Query('fileType') fileType: string,
  ) {
    const presignedUrl = await this.s3Service.getPresignedUrl(
      fileName,
      fileType,
    );
    return presignedUrl;
  }
}
