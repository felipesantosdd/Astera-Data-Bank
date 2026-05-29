/**
 * Roteamento entre backend (dev) e snapshot estático (prod).
 *
 * Em dev (`npm run dev`), o Vite proxia /api para o backend Spring em :8080.
 * Em build/prod (`npm run build`), os JSONs gerados por scripts/generate-snapshot.mjs
 * são servidos como arquivos estáticos a partir de /data/.
 */
const STATIC = import.meta.env.PROD || import.meta.env.VITE_USE_STATIC === 'true'

export const dataUrl = {
  monsters: (lang: string) =>
    STATIC
      ? `/data/monsters-${lang}.json`
      : `/api/monsters?lang=${lang}`,

  monsterDetail: (id: number, lang: string) =>
    STATIC
      ? `/data/monsters/${id}/${lang}.json`
      : `/api/monsters/${id}?lang=${lang}`,

  monsterArmor: (id: number, lang: string) =>
    STATIC
      ? `/data/monsters/${id}/armor-${lang}.json`
      : `/api/monsters/${id}/armor?lang=${lang}`,

  monsterDrops: (id: number, lang: string) =>
    STATIC
      ? `/data/monsters/${id}/drops-${lang}.json`
      : `/api/monsters/${id}/drops?lang=${lang}`,

  itemSources: (id: number, lang: string) =>
    STATIC
      ? `/data/items/${id}/sources-${lang}.json`
      : `/api/items/${id}/sources?lang=${lang}`,

  items: (lang: string) =>
    STATIC
      ? `/data/items-${lang}.json`
      : `/api/items?lang=${lang}`,

  weapons: (lang: string) =>
    STATIC
      ? `/data/weapons-${lang}.json`
      : `/api/weapons?lang=${lang}`,

  armor: (lang: string) =>
    STATIC
      ? `/data/armor-${lang}.json`
      : `/api/armor?lang=${lang}`,
}
