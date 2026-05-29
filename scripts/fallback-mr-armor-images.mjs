/**
 * Para sets MR (α+/β+) sem imagem, copia a imagem do set HR equivalente.
 * Ex: "Great Jagras α+ (MR)" → copia imagem de "Great Jagras α (HR)"
 *
 * Uso: node scripts/fallback-mr-armor-images.mjs
 */

import { readFile, copyFile, access } from 'node:fs/promises'
import { resolve, dirname }           from 'node:path'
import { fileURLToPath }              from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT       = resolve(__dirname, '../frontend/public/armor')
const ARMOR_EN  = resolve(__dirname, '../frontend/public/data/armor-en.json')

async function exists(path) {
  return access(path).then(() => true).catch(() => false)
}

async function main() {
  const armor = JSON.parse(await readFile(ARMOR_EN, 'utf-8'))

  // Mapa: nome normalizado → id do set
  const nameToId = new Map()
  armor.forEach(s => {
    const norm = s.name
      .replace(/\s*α\+?/g, '').replace(/\s*β\+?/g, '').replace(/\s*γ/g, '')
      .trim().toLowerCase()
    if (!nameToId.has(norm)) nameToId.set(norm, [])
    nameToId.get(norm).push(s)
  })

  let copied = 0, skipped = 0, notFound = 0

  for (const set of armor) {
    const dest = `${OUT}/sets/${set.id}.png`
    if (await exists(dest)) { skipped++; continue }

    // Só processa MR (α+/β+)
    if (set.rank !== 'MR') continue

    // Nome normalizado sem sufixo de tier
    const baseName = set.name
      .replace(/\s*α\+/g, '').replace(/\s*β\+/g, '')
      .trim().toLowerCase()

    // Encontra o set HR/LR α com a mesma base
    const candidates = (nameToId.get(baseName) ?? [])
      .filter(s => s.id !== set.id && s.rank !== 'MR')

    let srcFile = null

    // Prefere α sobre β
    const alphaSet = candidates.find(s => s.name.includes('α') && !s.name.includes('+'))
    const betaSet  = candidates.find(s => s.name.includes('β') && !s.name.includes('+'))
    const baseSet  = candidates.find(s => !s.name.includes('α') && !s.name.includes('β'))

    for (const candidate of [alphaSet, betaSet, baseSet].filter(Boolean)) {
      const src = `${OUT}/sets/${candidate.id}.png`
      if (await exists(src)) { srcFile = src; break }
    }

    if (!srcFile) {
      console.log(`✗ [${set.id}] ${set.name} — sem fallback`)
      notFound++
      continue
    }

    await copyFile(srcFile, dest)
    console.log(`✓ [${set.id}] ${set.name} ← copiado de ${srcFile.split('/').pop()}`)
    copied++
  }

  console.log(`\nCopiados: ${copied} | Já existiam: ${skipped} | Sem fallback: ${notFound}`)
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
