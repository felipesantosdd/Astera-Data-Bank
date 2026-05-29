/**
 * Baixa imagens de sets de armadura faltantes do Fextralife.
 * Versão 2 — tenta múltiplos padrões de URL + scraping da página da wiki.
 *
 * Uso: node scripts/download-armor-images-v2.mjs
 */

import { readFile, mkdir, writeFile, access } from 'node:fs/promises'
import { resolve, dirname }                    from 'node:path'
import { fileURLToPath }                       from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT       = resolve(__dirname, '../frontend/public/armor')
const ARMOR_EN  = resolve(__dirname, '../frontend/public/data/armor-en.json')
const WIKI_BASE = 'https://monsterhunterworld.wiki.fextralife.com'
const FILE_BASE = WIKI_BASE + '/file/Monster-Hunter-World'

const DELAY_MS  = 600   // respeita o rate-limit do wiki
const TIMEOUT   = 12000

async function exists(path) {
  return access(path).then(() => true).catch(() => false)
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function toSlug(name) {
  return name.toLowerCase()
    .replace(/α/g, 'alpha').replace(/β/g, 'beta').replace(/γ/g, 'gamma')
    .replace(/\+/g, 'plus').replace(/'/g, '').replace(/\./g, '')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

function toHyphen(name) {
  return name.toLowerCase()
    .replace(/α/g, 'a').replace(/β/g, 'b').replace(/γ/g, 'g')
    .replace(/\+/g, 'plus').replace(/'/g, '').replace(/\./g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function toHyphenFull(name) {
  return name.toLowerCase()
    .replace(/α/g, 'alpha').replace(/β/g, 'beta').replace(/γ/g, 'gamma')
    .replace(/\+/g, 'plus').replace(/'/g, '').replace(/\./g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function downloadPng(url, dest) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' }
    })
    if (!res.ok) return false
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 200 || buf[0] !== 0x89) return false
    await writeFile(dest, buf)
    return true
  } catch { return false }
}

// Scrapa a página wiki do set e extrai a URL da imagem do set
async function scrapeWikiPage(setName) {
  const pageName = setName
    .replace(/α/g, 'Alpha').replace(/β/g, 'Beta').replace(/γ/g, 'Gamma')
    .replace(/\s+/g, '+')

  const urls = [
    `${WIKI_BASE}/${pageName}+Armor+Set`,
    `${WIKI_BASE}/${pageName}+Set`,
    `${WIKI_BASE}/${pageName}+Armor`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' }
      })
      if (!res.ok) continue
      const html = await res.text()

      // Extrai todas URLs de imagens de armadura do HTML
      const matches = [...html.matchAll(/\/file\/Monster-Hunter-World\/([^"'<>\s]+\.png)/g)]
        .map(m => m[1])
        .filter(f =>
          (f.includes('armor') || f.includes('set')) &&
          !f.includes('placeholder') &&
          !f.includes('mhw-') &&
          !f.includes('wiki-guide-logo') &&
          !f.includes('gem_level') &&
          !f.includes('defense') &&
          !f.includes('damage') &&
          !f.includes('skill') &&
          !f.includes('decoration') &&
          !f.includes('zenny') &&
          !f.includes('currency') &&
          !f.includes('helm') &&
          !f.includes('head') &&
          !f.includes('chest') &&
          !f.includes('glove') &&
          !f.includes('waist') &&
          !f.includes('leg') &&
          !f.includes('coil') &&
          !f.includes('mail') &&
          !f.includes('trouser') &&
          !f.includes('mantle') &&
          !f.includes('faulds') &&
          !f.includes('vambraces') &&
          !f.includes('greaves')
        )

      const unique = [...new Set(matches)]
      if (unique.length > 0) return unique
    } catch { /* continue */ }
    await sleep(200)
  }
  return []
}

async function downloadSetImage(setName, dest) {
  const slug     = toSlug(setName)
  const hyphen   = toHyphen(setName)
  const hyphenFl = toHyphenFull(setName)
  const base     = slug.replace(/_alpha$/, '').replace(/_beta$/, '').replace(/_gamma$/, '').replace(/_plus$/, '')
  const baseH    = hyphen.replace(/-a$/, '').replace(/-b$/, '').replace(/-g$/, '').replace(/-plus$/, '')

  // Padrão 1: snake_case clássico
  const snakeVariants = [
    `${slug}_armor_set_mhw_small.png`,
    `${base}_armor_set_mhw_small.png`,
    `${slug}_set_mhw_small.png`,
    `${base}_set_mhw_small.png`,
  ]
  for (const v of snakeVariants) {
    if (await downloadPng(`${FILE_BASE}/${v}`, dest)) return { ok: true, via: v }
  }

  // Padrão 2: hyphen wiki-guide
  const hyphenVariants = [
    `${hyphen}-armor-set-mhw-wiki-guide.png`,
    `${hyphenFl}-armor-set-mhw-wiki-guide.png`,
    `${baseH}-armor-set-mhw-wiki-guide.png`,
    `${hyphen}-set-mhw-wiki-guide.png`,
    `${baseH}-set-mhw-wiki-guide.png`,
    `${hyphen}-armor-mhw-wiki-guide.png`,
  ]
  for (const v of hyphenVariants) {
    if (await downloadPng(`${FILE_BASE}/${v}`, dest)) return { ok: true, via: v }
  }

  // Padrão 3: para γ sets, tenta α do mesmo monstro
  if (setName.includes('γ') || setName.includes('Gamma')) {
    const alphaName = setName.replace(/γ/g, 'α').replace(/Gamma/g, 'Alpha')
    const alphaSlug = toSlug(alphaName)
    const alphaHyphen = toHyphen(alphaName)
    const alphaH = toHyphenFull(alphaName)
    const alphaVariants = [
      `${alphaSlug}_armor_set_mhw_small.png`,
      `${alphaHyphen}-armor-set-mhw-wiki-guide.png`,
      `${alphaH}-armor-set-mhw-wiki-guide.png`,
    ]
    for (const v of alphaVariants) {
      if (await downloadPng(`${FILE_BASE}/${v}`, dest)) return { ok: true, via: '(γ→α) ' + v }
    }
  }

  // Padrão 4: scraping da página wiki
  await sleep(DELAY_MS)
  const found = await scrapeWikiPage(setName)
  for (const imgFile of found) {
    if (await downloadPng(`${WIKI_BASE}/file/Monster-Hunter-World/${imgFile}`, dest)) {
      return { ok: true, via: '(scraped) ' + imgFile }
    }
  }

  return { ok: false }
}

async function main() {
  const armor = JSON.parse(await readFile(ARMOR_EN, 'utf-8'))
  await mkdir(`${OUT}/sets`, { recursive: true })

  const existingIds = new Set(
    (await import('node:fs')).default.readdirSync(`${OUT}/sets`).map(f => parseInt(f))
  )

  const missing = armor.filter(a => !existingIds.has(a.id))
  console.log(`Sets faltando: ${missing.length} / ${armor.length}`)
  console.log('Iniciando download...\n')

  let ok = 0, fail = 0
  const failed = []

  for (const set of missing) {
    const dest = `${OUT}/sets/${set.id}.png`
    process.stdout.write(`[${set.id}] ${set.name} (${set.rank}) ... `)

    const result = await downloadSetImage(set.name, dest)

    if (result.ok) {
      console.log(`✓ ${result.via}`)
      ok++
    } else {
      console.log('✗ não encontrado')
      failed.push({ id: set.id, name: set.name, rank: set.rank })
      fail++
    }

    await sleep(DELAY_MS)
  }

  console.log(`\n── Resultado ──`)
  console.log(`✓ Baixados: ${ok}`)
  console.log(`✗ Não encontrados: ${fail}`)

  if (failed.length > 0) {
    console.log('\nSets sem imagem:')
    failed.forEach(s => console.log(`  [${s.id}] ${s.name} (${s.rank})`))
  }
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
