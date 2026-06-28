import { NextResponse } from 'next/server'

import { applySimilarExcludeFilter } from '@/lib/api/similar-characters-query'
import { parseSimilarExcludeIds } from '@/lib/api/similar-characters-params'
import {
  rankSimilarCharacters,
  type CharacterSimilarityFields,
} from '@/lib/character-similarity'
import { supabase } from '@/lib/supabase'
import type { Character } from '@/lib/types'

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 10
const POOL_FETCH_LIMIT = 30

type CharacterRow = Character & CharacterSimilarityFields

/** count 필드 기본값 보정 */
function normalizeCharacter(character: CharacterRow): Character {
  return {
    ...character,
    like_count: character.like_count ?? 0,
    comment_count: character.comment_count ?? 0,
    message_count: character.message_count ?? 0,
  }
}

/** 공개 캐릭터 후보 pool에 dedupe 추가 */
function mergeCandidates(pool: CharacterRow[], rows: CharacterRow[] | null): void {
  if (!rows?.length) return

  const existingIds = new Set(pool.map((row) => row.id))
  for (const row of rows) {
    if (!existingIds.has(row.id)) {
      pool.push(row)
      existingIds.add(row.id)
    }
  }
}

/** GET /api/characters/[id]/similar — tag + genre overlap + 인기 fallback */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: characterId } = await params
    const { searchParams } = new URL(req.url)

    const parsedLimit = Number.parseInt(searchParams.get('limit') ?? '', 10)
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT

    const excludeIds = parseSimilarExcludeIds(
      searchParams.get('exclude'),
      characterId,
    )

    const { data: source, error: sourceError } = await supabase
      .from('characters')
      .select('id, genres, tag, mood, message_count')
      .eq('id', characterId)
      .maybeSingle()

    if (sourceError) {
      console.error('[/api/characters/[id]/similar GET] source', sourceError)
      return NextResponse.json({ error: sourceError.message }, { status: 500 })
    }

    if (!source) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    const candidates: CharacterRow[] = []
    const sourceTag = source.tag?.trim()
    const sourceGenres = (source.genres ?? []).filter(Boolean)

    // tag 일치 후보 (v1 주 신호)
    if (sourceTag) {
      const tagQuery = applySimilarExcludeFilter(
        supabase
          .from('characters')
          .select('*')
          .eq('is_public', true)
          .eq('tag', sourceTag)
          .limit(POOL_FETCH_LIMIT),
        excludeIds,
        characterId,
      )

      const { data: tagMatches, error: tagError } = await tagQuery

      if (tagError) {
        console.error('[/api/characters/[id]/similar GET] tag pool', tagError)
        return NextResponse.json({ error: tagError.message }, { status: 500 })
      }

      mergeCandidates(candidates, tagMatches as CharacterRow[] | null)
    }

    // genre overlap 후보
    if (sourceGenres.length > 0) {
      const genreQuery = applySimilarExcludeFilter(
        supabase
          .from('characters')
          .select('*')
          .eq('is_public', true)
          .overlaps('genres', sourceGenres)
          .limit(POOL_FETCH_LIMIT),
        excludeIds,
        characterId,
      )

      const { data: genreMatches, error: genreError } = await genreQuery

      if (genreError) {
        console.error('[/api/characters/[id]/similar GET] genre pool', genreError)
        return NextResponse.json({ error: genreError.message }, { status: 500 })
      }

      mergeCandidates(candidates, genreMatches as CharacterRow[] | null)
    }

    // pool 부족 시 인기순 fallback
    if (candidates.length < limit * 2) {
      const popularQuery = applySimilarExcludeFilter(
        supabase
          .from('characters')
          .select('*')
          .eq('is_public', true)
          .order('message_count', { ascending: false })
          .limit(POOL_FETCH_LIMIT),
        excludeIds,
        characterId,
      )

      const { data: popularMatches, error: popularError } = await popularQuery

      if (popularError) {
        console.error('[/api/characters/[id]/similar GET] popular pool', popularError)
        return NextResponse.json({ error: popularError.message }, { status: 500 })
      }

      mergeCandidates(candidates, popularMatches as CharacterRow[] | null)
    }

    const ranked = rankSimilarCharacters(source, candidates, {
      limit,
      excludeIds,
    })

    return NextResponse.json(ranked.map(normalizeCharacter))
  } catch (err) {
    console.error('[/api/characters/[id]/similar GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
