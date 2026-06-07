import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3, S3_BUCKET, S3_REGION } from '@/lib/s3'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'file은 필수입니다' }, { status: 400 })
  }

  const key = `character/profile/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  })

  try {
    await s3.send(command)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'S3 업로드 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`
  return NextResponse.json({ publicUrl })
}
