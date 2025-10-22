export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const s3Config = (): S3Config => ({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
});

