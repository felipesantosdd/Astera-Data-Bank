/**
 * Para cada set MR ainda sem imagem, faz scraping da página do Fextralife
 * e baixa a imagem do set encontrada no HTML.
 *
 * Uso: node scripts/scrape-mr-armor-images.mjs
 */

import { readFile, writeFile, access, mkdir } from 'node:fs/promises'
import { resolve, dirname }                    from 'node:path'
import { fileURLToPath }                       from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT       = resolve(__dirname, '../frontend/public/armor')
const ARMOR_EN  = resolve(__dirname, '../frontend/public/data/armor-en.json')
const WIKI      = 'https://monsterhunterworld.wiki.fextralife.com'
const FILE_BASE = WIKI + '/file/Monster-Hunter-World'

const DELAY = 700

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

// Constrói variações de nome de página para o set
function pageVariants(name) {
  const n = name
    .replace(/α\+/g, 'Alpha+').replace(/β\+/g, 'Beta+').replace(/γ\+/g, 'Gamma+')
    .replace(/α/g, 'Alpha').replace(/β/g, 'Beta').replace(/γ/g, 'Gamma')

  return [
    `${n}+Armor+Set`,
    `${n}+Set`,
    `${n}+Armor`,
    `${n.replace(/\+/g, '%2B')}+Armor+Set`,
    `${n}`,
  ]
}

async function scrapePage(setName) {
  for (const variant of pageVariants(setName)) {
    const url = `${WIKI}/${variant.replace(/ /g, '+')}`
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(12000), headers: {'User-Agent':'Mozilla/5.0 Chrome/120'} })
      if (!r.ok) continue
      const html = await r.text()

      // Filtra imagens que parecem ser de set de armadura (não peças individuais)
      const EXCLUDE = ['helm','mail','vambraces','coil','greaves','headgear','gloves',
        'belt','trousers','_s.png','skill','gem','zenny','defense','damage','mods',
        'wiki-guide-logo','placeholder','decoration','currency','slider']

      const imgs = [...html.matchAll(/\/file\/Monster-Hunter-World\/([^"'\s<>]+\.png)/g)]
        .map(m => m[1])
        .filter(f => !EXCLUDE.some(ex => f.includes(ex)))
        .filter(f => f.includes('armor') || f.includes('set'))

      // Prioriza imagens de set (não de peça)
      const setImgs = imgs.filter(f => f.includes('set'))
      const anyImgs = imgs

      return [...new Set([...setImgs, ...anyImgs])]
    } catch { /* continue */ }
    await sleep(200)
  }
  return []
}

async function main() {
  const armor = JSON.parse(await readFile(ARMOR_EN, 'utf-8'))
  await mkdir(`${OUT}/sets`, { recursive: true })

  const existingIds = new Set(
    (await import('node:fs')).default.readdirSync(`${OUT}/sets`).map(f => parseInt(f))
  )

  const missing = armor.filter(a => !existingIds.has(a.id))
  console.log(`Sets ainda faltando: ${missing.length}`)
  console.log('Iniciando scraping...\n')

  let ok = 0, fail = 0
  const failed = []

  for (const set of missing) {
    const dest = `${OUT}/sets/${set.id}.png`
    process.stdout.write(`[${set.id}] ${set.name} (${set.rank}) ... `)

    const imgs = await scrapePage(set.name)
    let found = false

    for (const img of imgs) {
      const url = `${FILE_BASE}/${img}`
      if (await downloadPng(url, dest)) {
        console.log(`✓ ${img.slice(0, 55)}`)
        found = true
        ok++
        break
      }
    }

    if (!found) {
      console.log(`✗ (${imgs.length} candidatas, nenhuma válida)`)
      failed.push({ id: set.id, name: set.name, rank: set.rank })
      fail++
    }

    await sleep(DELAY)
  }

  console.log(`\n── Resultado ──`)
  console.log(`✓ Baixados: ${ok}`)
  console.log(`✗ Não encontrados: ${fail}`)
  if (failed.length) {
    console.log('\nAinda faltando:')
    failed.forEach(s => console.log(`  [${s.id}] ${s.name} (${s.rank})`))
  }
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
