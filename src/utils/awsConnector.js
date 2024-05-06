const AWS = require('aws-sdk');
const { S3 } = require('@aws-sdk/client-s3');
const dayjs = require('dayjs');
const { readFile } = require('fs/promises');
const mime = require('mime-types');
const createID = require('./createID');
const { log } = require('console');

AWS.config.update({
  accessKeyId: process.env.AWSS3_ID,
  secretAccessKey: process.env.AWSS3_KEY
});

const s3 = new S3({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWSS3_ID,
    secretAccessKey: process.env.AWSS3_KEY
  }
});

class AmazonCDN {
  constructor() {
    this._s3 = s3;
  }

  async uploadFile(user, fileData, path) {
    try {
      const data = await readFile(path);
      const uploadResult = await this.uploadToS3(data, fileData, user);
      return {
        url: uploadResult.fileUrl,
        id: uploadResult.id,
        uploadedAt: uploadResult.uploadedAt
      };
    } catch (error) {
      log(error);
      throw new Error('Failed to upload file to S3.');
    }
  }

  async uploadToS3(data, fileData, user) {
    try {
      const newID = createID(10);
      const fileExt = fileData.fileExtension;
      const mimeType = mime.lookup(fileExt);
      const key = `${user.userid}/${fileData.fileName}`;

      const params = {
        Bucket: process.env.AWSS3_BUCKET,
        Key: key,
        Body: data,
        ContentType: mimeType,
        ACL: 'private',
        CacheControl: 'max-age=0'
      };

      await this._s3.putObject(params).promise();

      return {
        fileUrl: `${process.env.SERVER}/${key}`,
        id: newID,
        uploadedAt: dayjs().format()
      };
    } catch (error) {
      log(error);
      throw new Error('Failed to upload file to S3.');
    }
  }

  async listUserFiles(userId) {
    try {
      const params = {
        Bucket: process.env.AWSS3_BUCKET,
        Prefix: `${userId}/`
      };
      const data = await this._s3.listObjectsV2(params).promise();
      return data.Contents.map(content => content.Key);
    } catch (error) {
      log(error);
      throw new Error('Failed to list user files in S3.');
    }
  }

  async deleteFile(userId, fileName) {
    try {
      const params = {
        Bucket: process.env.AWSS3_BUCKET,
        Key: `${userId}/${fileName}`
      };
      await this._s3.deleteObject(params).promise();
      return { success: true };
    } catch (error) {
      log(error);
      throw new Error('Failed to delete file from S3.');
    }
  }

  async checkUserExists(userId) {
    try {
      const params = {
        Bucket: process.env.AWSS3_BUCKET,
        Prefix: `${userId}/`
      };
      const data = await this._s3.listObjectsV2(params).promise();
      return data.Contents.length > 0;
    } catch (error) {
      log(error);
      throw new Error('Failed to check if user exists in S3.');
    }
  }
}

module.exports = AmazonCDN;
