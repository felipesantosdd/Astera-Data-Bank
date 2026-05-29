/**
 * Retorna a URL local da imagem do set de armadura (por ID).
 * Salvo em public/armor/sets/{id}.png pelo script download-armor-images.mjs
 */
export function armorSetImageUrl(setId: number): string {
  return `/armor/sets/${setId}.png`
}

/**
 * Retorna a URL local da imagem de uma peça de armadura (por ID).
 * Salvo em public/armor/pieces/{id}.png pelo script download-armor-images.mjs
 */
export function armorPieceImageUrl(pieceId: number): string {
  return `/armor/pieces/${pieceId}.png`
}

/**
 * Ícone de slot local (baixado de fextralife).
 * type: 'head' | 'chest' | 'arms' | 'waist' | 'legs'
 */
export function armorSlotIcon(type: string): string {
  const map: Record<string, string> = {
    head:  '/armor/slot-head.png',
    chest: '/armor/slot-chest.png',
    arms:  '/armor/slot-arms.png',
    waist: '/armor/slot-waist.png',
    legs:  '/armor/slot-legs.png',
  }
  return map[type.toLowerCase()] ?? '/armor/slot-head.png'
}
