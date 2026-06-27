/** 캐릭터 ID 기반 일관된 대화 수 (실제 통계 연동 전 UI용) */
export function getCharacterChatCountValue(characterId: string): number {
  let hash = 0;
  for (const char of characterId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return (hash % 99000) + 100;
}

export function formatCharacterChatCount(characterId: string): string {
  const chatCount = getCharacterChatCountValue(characterId);

  if (chatCount >= 10000) {
    const thousands = chatCount / 1000;
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }
  if (chatCount >= 1000) {
    const thousands = chatCount / 1000;
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }

  return String(chatCount);
}

/** UI용 좋아요 수 (실제 통계 연동 전) */
export function getCharacterLikeCountValue(characterId: string): number {
  let hash = 0;
  for (const char of characterId) {
    hash = (hash * 17 + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 500) + 1;
}

/** UI용 이미지 수 (실제 통계 연동 전) */
export function getCharacterImageCountValue(characterId: string): number {
  let hash = 0;
  for (const char of characterId) {
    hash = (hash * 13 + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 100) + 1;
}

export function formatCompactCount(value: number): string {
  if (value >= 10000) {
    const thousands = value / 1000;
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }
  return String(value);
}
