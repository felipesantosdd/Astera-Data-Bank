/**
 * Script final — scraping Fextralife para sets MR ainda faltando.
 * Tenta: (1) página do set de armadura, (2) página do monstro.
 *
 * Uso: node scripts/scrape-mr-armor-v3.mjs
 */

import { readFile, writeFile, access, mkdir } from 'node:fs/promises'
import { resolve, dirname }                    from 'node:path'
import { fileURLToPath }                       from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT       = resolve(__dirname, '../frontend/public/armor')
const ARMOR_EN  = resolve(__dirname, '../frontend/public/data/armor-en.json')
const WIKI      = 'https://monsterhunterworld.wiki.fextralife.com'
const FILE_BASE = WIKI + '/file/Monster-Hunter-World'

const DELAY = 800

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function exists(p) { return access(p).then(()=>true).catch(()=>false) }

async function downloadPng(url, dest) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(12000), headers: {'User-Agent':'Mozilla/5.0 Chrome/120'} })
    if (!r.ok) return false
    const buf = Buffer.from(await r.arrayBuffer())
    if (buf.length < 200 || buf[0] !== 0x89) return false
    await writeFile(dest, buf)
    return true
  } catch { return false }
}

const PIECE_TERMS = ['helm','mail','vambraces','coil','greaves','headgear','gloves',
  'belt','trousers','_s.png','skill','gem_level','zenny','damage','defense',
  'wiki-guide-logo','placeholder','decoration','currency','slider','-s-icon',
  'mhw-fire','mhw-water','mhw-thunder','mhw-ice','mhw-dragon','mhw-bligh',
  'mhw-wiki-icebo','master-rank-32']

function isSetImage(f) {
  if (PIECE_TERMS.some(t => f.toLowerCase().includes(t))) return false
  return f.includes('armor') || f.includes('set')
}

async function fetchImages(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(12000), headers: {'User-Agent':'Mozilla/5.0 Chrome/120'} })
    if (!r.ok) return []
    const html = await r.text()
    const imgs = [...html.matchAll(/\/file\/Monster-Hunter-World\/([^"'\s<>]+\.png)/g)]
      .map(m => m[1])
      .filter(isSetImage)
    return [...new Set(imgs)]
  } catch { return [] }
}

function stripTier(name) {
  return name
    .replace(/\s*α\+?/gi, '').replace(/\s*β\+?/gi, '').replace(/\s*γ\+?/gi, '')
    .trim()
}

async function findSetImages(setName) {
  const base = stripTier(setName)
  const baseUrl = base.replace(/ /g, '+')

  // Estratégia 1: página do set de armadura
  const armorPages = [
    `${WIKI}/${baseUrl}+Armor+Set`,
    `${WIKI}/${baseUrl}+Alpha+Plus+Armor+Set`,
    `${WIKI}/${baseUrl}+Armor`,
  ]
  for (const url of armorPages) {
    const imgs = await fetchImages(url)
    if (imgs.length > 0) return { imgs, via: url }
    await sleep(150)
  }

  // Estratégia 2: página do monstro diretamente
  const monsterPage = `${WIKI}/${baseUrl}`
  const imgs = await fetchImages(monsterPage)
  if (imgs.length > 0) return { imgs, via: monsterPage }

  return { imgs: [], via: null }
}

async function main() {
  const armor = JSON.parse(await readFile(ARMOR_EN, 'utf-8'))
  await mkdir(`${OUT}/sets`, { recursive: true })

  const existingIds = new Set(
    (await import('node:fs')).default.readdirSync(`${OUT}/sets`).map(f => parseInt(f))
  )

  const missing = armor.filter(a => !existingIds.has(a.id))
  console.log(`Sets ainda faltando: ${missing.length}\n`)

  let ok = 0, fail = 0
  const failed = []

  for (const set of missing) {
    const dest = `${OUT}/sets/${set.id}.png`
    process.stdout.write(`[${set.id}] ${set.name} ... `)

    const { imgs, via } = await findSetImages(set.name)

    // Prioriza imagens que têm "set" no nome
    const setFirst = [
      ...imgs.filter(f => f.includes('set')),
      ...imgs.filter(f => !f.includes('set')),
    ]

    let found = false
    for (const img of setFirst) {
      if (await downloadPng(`${FILE_BASE}/${img}`, dest)) {
        console.log(`✓ ${img.slice(0, 55)}`)
        found = true; ok++
        break
      }
    }

    if (!found) {
      console.log(`✗ (${imgs.length} candidatas)`)
      failed.push(`[${set.id}] ${set.name} (${set.rank})`)
      fail++
    }

    await sleep(DELAY)
  }

  console.log(`\n── Resultado ──`)
  console.log(`✓ Baixados: ${ok}  ✗ Não encontrados: ${fail}`)
  if (failed.length) {
    console.log('\nAinda faltando:')
    failed.forEach(s => console.log(' ', s))
  }
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
