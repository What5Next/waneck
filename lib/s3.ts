import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const S3_BUCKET = process.env.AWS_S3_BUCKET!
export const S3_REGION = process.env.AWS_REGION!

const PUBLIC_URL_PREFIX = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`

/** 이 버킷이 발급한 public URL이면 key를, 아니면 null을 반환 */
export function getS3KeyFromPublicUrl(url: string): string | null {
  if (!url.startsWith(PUBLIC_URL_PREFIX)) return null
  const key = url.slice(PUBLIC_URL_PREFIX.length)
  return key || null
}

/** public URL로 S3 객체 삭제 — 이 버킷 소유가 아니면 아무 것도 하지 않음 */
export async function deleteS3ObjectByUrl(url: string): Promise<void> {
  const key = getS3KeyFromPublicUrl(url)
  if (!key) return

  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }))
}
