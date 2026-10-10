import { NextRequest, NextResponse } from 'next/server'

import { hasCharacterCreateApiKey } from '@/lib/api/character-create-access'
import { uploadCharacterProfileImage } from '@/lib/api/character-image-upload-server'

/**
 * POST /api/admin/upload — 서버 간 캐릭터 프로필 이미지 업로드.
 * `Authorization: Bearer <CHARACTER_CREATE_API_KEY>` 필요.
 */
export async function POST(req: NextRequest) {
  if (!hasCharacterCreateApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'file은 필수입니다' }, { status: 400 })
  }

  try {
    const publicUrl = await uploadCharacterProfileImage(file)
    return NextResponse.json({ publicUrl })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'S3 업로드 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
