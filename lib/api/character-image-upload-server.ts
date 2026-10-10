import { PutObjectCommand } from '@aws-sdk/client-s3'

import { s3, S3_BUCKET, S3_REGION } from '@/lib/s3'

/** 캐릭터 프로필 이미지를 S3에 올리고 공개 URL을 반환한다. */
export async function uploadCharacterProfileImage(file: File): Promise<string> {
  const key = `character/profile/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  )

  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`
}
