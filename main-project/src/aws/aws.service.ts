import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private readonly s3: AWS.S3;

  constructor() {
    AWS.config.update({
      region: process.env.AWS_BUCKET_REGION,
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.s3 = new AWS.S3();
  }

  async uploadImage(files: any, chatRoomNo: number) {
    const uploadImageList: object[] = files.map((file) => {
      const key = `chat/${chatRoomNo}/${Date.now()}_${file.originalname}`;

      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
        Key: key,
        Body: file.buffer,
      };
    });

    await uploadImageList.map((uploadFile: any) => {
      this.s3.upload(uploadFile, (err, data) => {
        if (err) {
          throw new InternalServerErrorException(
            '이미지 업로드에 실패하였습니다.',
          );
        }
      });
    });

    const imageUrlList: string[] = uploadImageList.map((file: any) => {
      return process.env.AWS_BUCKET_LINK + file.Key;
    });

    return imageUrlList;
  }

  async uploadProfileImage(image, userNo: number) {
    const imageKey = `user/${userNo}/${Date.now()}_${
      image.originalname
    }`.replace(/ /g, '');
    const profileImage = {
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: 'public-read',
      Key: imageKey,
      Body: image.buffer,
    };

    this.s3.upload(profileImage, (err, data) => {
      if (err) {
        console.log(err);

        throw new InternalServerErrorException(
          '이미지 업로드에 실패하였습니다.',
        );
      }
    });

    return process.env.AWS_BUCKET_LINK + imageKey;
  }
}
