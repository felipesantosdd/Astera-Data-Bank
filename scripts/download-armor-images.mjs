/**
 * Baixa as imagens dos sets de armadura e das peças do fextralife.
 * Usa armor-en.json (nomes em inglês) para construir URLs corretas.
 * Pula arquivos já existentes (pode ser re-executado).
 *
 * Uso: node scripts/download-armor-images.mjs
 */

import { readFile, mkdir, writeFile, access } from 'node:fs/promises'
import { resolve, dirname }                    from 'node:path'
import { fileURLToPath }                       from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT       = resolve(__dirname, '../frontend/public/armor')
const ARMOR_EN  = resolve(__dirname, '../frontend/public/data/armor-en.json')
const BASE      = 'https://monsterhunterworld.wiki.fextralife.com/file/Monster-Hunter-World'

function toSlug(name) {
  return name.toLowerCase()
    .replace(/α/g, 'alpha').replace(/β/g, 'beta')
    .replace(/\+/g, 'plus').replace(/'/g, '')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

async function exists(path) {
  return access(path).then(() => true).catch(() => false)
}

async function downloadPng(url, dest) {
  const res = await fetch(url)
  if (!res.ok) return false
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 100 || buf[0] !== 0x89) return false
  await writeFile(dest, buf)
  return true
}

// Tenta várias variações de URL para o set
async function downloadSetImage(setName, dest) {
  const slug = toSlug(setName)
  const base = slug.replace(/_alpha$/, '').replace(/_beta$/, '').replace(/_plus$/, '')
  const variants = [
    `${slug}_armor_set_mhw_small.png`,
    `${base}_armor_set_mhw_small.png`,
    `${slug}_set_mhw_small.png`,
    `${base}_set_mhw_small.png`,
  ]
  for (const v of variants) {
    if (await downloadPng(`${BASE}/${v}`, dest)) return true
  }
  return false
}

// Tenta várias variações para a peça
async function downloadPieceImage(pieceName, dest) {
  const slug = toSlug(pieceName)
  const base = slug.replace(/_alpha$/, '').replace(/_beta$/, '')
  const variants = [
    `${slug}_male.png`,
    `${base}_male.png`,
  ]
  for (const v of variants) {
    if (await downloadPng(`${BASE}/${v}`, dest)) return true
  }
  return false
}

async function main() {
  const armor = JSON.parse(await readFile(ARMOR_EN, 'utf-8'))
  await mkdir(`${OUT}/sets`,   { recursive: true })
  await mkdir(`${OUT}/pieces`, { recursive: true })

  let setsOk = 0, setsFail = 0, piecesOk = 0, piecesFail = 0
  let setsSkipped = 0, piecesSkipped = 0

  for (const set of armor) {
    // ── Set ──
    const setDest = `${OUT}/sets/${set.id}.png`
    if (await exists(setDest)) {
      setsSkipped++
    } else {
      const ok = await downloadSetImage(set.name, setDest)
      if (ok) setsOk++; else setsFail++
    }

    // ── Peças ──
    for (const piece of set.pieces) {
      const pieceDest = `${OUT}/pieces/${piece.id}.png`
      if (await exists(pieceDest)) {
        piecesSkipped++
        continue
      }
      const ok = await downloadPieceImage(piece.name, pieceDest)
      if (ok) piecesOk++; else piecesFail++
    }

    process.stdout.write('.')
  }

  const total = setsOk + setsFail + setsSkipped
  console.log(`\n\nSets:  ${setsOk} baixados / ${setsSkipped} já existiam / ${setsFail} sem imagem`)
  console.log(`Peças: ${piecesOk} baixadas / ${piecesSkipped} já existiam / ${piecesFail} sem imagem`)
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
