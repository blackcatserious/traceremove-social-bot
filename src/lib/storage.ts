import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('S3 configuration missing: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY required');
    }
    
    s3Client = new S3Client({
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: 'us-east-1',
      forcePathStyle: true,
    });
  }
  return s3Client;
}

export async function uploadFile(
  key: string,
  content: string | Buffer,
  contentType: string = 'text/plain'
): Promise<string> {
  const bucket = process.env.S3_BUCKET || 'traceremove-content';
  const client = getS3Client();
  
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: content,
    ContentType: contentType,
  });
  
  await client.send(command);
  return `s3://${bucket}/${key}`;
}

export async function downloadFile(key: string): Promise<string> {
  const bucket = process.env.S3_BUCKET || 'traceremove-content';
  const client = getS3Client();
  
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  const response = await client.send(command);
  const content = await response.Body?.transformToString();
  return content || '';
}

export async function deleteFile(key: string): Promise<void> {
  const bucket = process.env.S3_BUCKET || 'traceremove-content';
  const client = getS3Client();
  
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  await client.send(command);
}

export function generateContentKey(notionId: string, type: 'markdown' | 'attachment', filename?: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  if (type === 'markdown') {
    return `content/${timestamp}/${notionId}.md`;
  } else {
    return `attachments/${timestamp}/${notionId}/${filename || 'file'}`;
  }
}

export async function testStorageConnection(): Promise<void> {
  const bucket = process.env.S3_BUCKET || 'traceremove-content';
  const client = getS3Client();
  
  // Test with a simple health check file
  const testKey = `health-check/${Date.now()}.txt`;
  const testContent = 'S3 health check';
  
  try {
    // Test upload
    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    await client.send(uploadCommand);
    
    // Test download to verify the file was uploaded
    const downloadCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: testKey,
    });
    const response = await client.send(downloadCommand);
    
    if (!response.Body) {
      throw new Error('S3 health check file upload/download failed');
    }
    
    // Clean up test file
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: testKey,
    });
    await client.send(deleteCommand);
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('NoSuchBucket')) {
      throw new Error(`S3 bucket '${bucket}' does not exist or is not accessible`);
    }
    throw error;
  }
}
