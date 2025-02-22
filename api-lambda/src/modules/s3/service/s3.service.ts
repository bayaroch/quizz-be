import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from 'src/config.service';
import { v4 as uuidv4 } from 'uuid';

import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  private s3Client = new S3Client({
    region: this.configService.awsRegion,
  });

  async getPresignedUrl(fileName: string, fileType: string): Promise<string> {
    const key = `${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
      // TODO env ruu oruulah uu?
      Bucket: 'quiz-stack-images-535002852577-us-east-1',
      Key: key,
      ContentType: fileType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 900 }); // 15 min expiry
  }
}
