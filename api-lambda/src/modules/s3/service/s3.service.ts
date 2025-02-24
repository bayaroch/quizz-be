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

  async getPresignedUrl(
    fileName: string,
    fileType: string,
  ): Promise<{
    url: string;
    file_url: string;
    file_name: string;
    key: string;
  }> {
    const key = `${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
      // TODO env ruu oruulah uu?
      Bucket: 'quiz-stack-images-535002852577-us-east-1',
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    }); // 15 min expiry

    const fileUrl = 'quiz-stack-images-535002852577-us-east-1/' + key;

    return {
      url: presignedUrl,
      file_url: fileUrl,
      file_name: fileName,
      key: key,
    };
  }
}
/*
def self.create_presigned_url(folder, file_name, content_type, acl = 'public-read')
    key = "#{folder}/#{file_name}"
    presigned_url = S3_BUCKET.object(key).presigned_url(
      :put,
      {
        content_type: content_type,
        expires_in: 1800,
        acl: acl
      }
    )
    file_url = S3_BUCKET.url + '/' + key
    { url: presigned_url, file_url: file_url, file_name: file_name, key: key }
  end
*/
