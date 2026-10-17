import type { CharacterSituationImage } from '@/lib/types'

/** Opening artwork is stored alongside situation images, without a text trigger. */
export const OPENING_IMAGE_LABEL = '__waneck_opening_image__'

export function isOpeningImageLabel(label: string | null | undefined): boolean {
  return label === OPENING_IMAGE_LABEL
}

export function getOpeningImageUrl(images: Pick<CharacterSituationImage, 'image_url' | 'label'>[] | undefined): string {
  return images?.find((image) => isOpeningImageLabel(image.label))?.image_url ?? ''
}
