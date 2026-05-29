/**
 * Script final com mapeamento de nomes alternativos no Fextralife.
 *
 * Uso: node scripts/scrape-mr-armor-final.mjs
 */

import { readFile, writeFile, access, mkdir } from 'node:fs/promises'
import { resolve, dirname }                    from 'node:path'
import { fileURLToPath }                       from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT       = resolve(__dirname, '../frontend/public/armor')
const ARMOR_EN  = resolve(__dirname, '../frontend/public/data/armor-en.json')
const WIKI      = 'https://monsterhunterworld.wiki.fextralife.com'
const FILE_BASE = WIKI + '/file/Monster-Hunter-World'
const DELAY     = 700

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function fileExists(p) { return access(p).then(()=>true).catch(()=>false) }

async function downloadPng(url, dest) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' } })
    if (!r.ok) return false
    const buf = Buffer.from(await r.arrayBuffer())
    if (buf.length < 200 || buf[0] !== 0x89) return false
    await writeFile(dest, buf)
    return true
  } catch { return false }
}

const EXCLUDE = [
  'helm','mail','vambraces','coil','greaves','headgear','gloves','belt','trousers',
  '_s.png','skill','gem_level','zenny','damage','defense','wiki-guide-logo',
  'placeholder','decoration','currency','slider','mhw-fire','mhw-water',
  'mhw-thunder','mhw-ice','mhw-dragon','master-rank-32','iceborne-master'
]

function isSetImage(f) {
  if (EXCLUDE.some(t => f.toLowerCase().includes(t))) return false
  return f.includes('armor') || f.includes('set')
}

async function fetchImages(path) {
  try {
    const r = await fetch(`${WIKI}/${path}`, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' } })
    if (!r.ok) return []
    const html = await r.text()
    return [...new Set(
      [...html.matchAll(/\/file\/Monster-Hunter-World\/([^"'\s<>]+\.png)/g)]
        .map(m => m[1])
        .filter(isSetImage)
    )]
  } catch { return [] }
}

// Mapeamento: nome exato do set → páginas Fextralife a tentar
const PAGE_OVERRIDES = {
  // HR sets
  'Skull α':           ['Skull+Armor+Set', 'Skull+Set', 'Skull'],
  'Brigade':           ['Brigade+Alpha+Armor+Set', 'Brigade+Armor+Set', 'Brigade'],
  'Gala Suit':         ['Gala+Suit+Armor+Set', 'Gala+Suit'],
  'Sealed Eyepatch α': ['Sealed+Eyepatch+Armor+Set', 'Sealed+Eyepatch'],
  'Kulu-Ya-Ku Head α': ['Kulu-Ya-Ku+Head+Armor+Set', 'Kulu-Ya-Ku+Head'],
  'Wiggler Head α':    ['Wiggler+Head+Armor+Set', 'Wiggler+Head'],

  // MR — nome curto → nome completo na wiki
  'Beo α+':              ['Beotodus+Armor+Set', 'Beotodus'],
  'Beo β+':              ['Beotodus+Armor+Set', 'Beotodus'],
  'Coral Pukei α+':      ['Coral+Pukei-Pukei+Armor+Set', 'Coral+Pukei-Pukei'],
  'Coral Pukei β+':      ['Coral+Pukei-Pukei+Armor+Set', 'Coral+Pukei-Pukei'],
  'Viper Kadachi α+':    ['Viper+Tobi-Kadachi+Armor+Set', 'Viper+Tobi-Kadachi'],
  'Viper Kadachi β+':    ['Viper+Tobi-Kadachi+Armor+Set', 'Viper+Tobi-Kadachi'],
  'Fulgur Anja α+':      ['Fulgur+Anjanath+Armor+Set', 'Fulgur+Anjanath'],
  'Fulgur Anja β+':      ['Fulgur+Anjanath+Armor+Set', 'Fulgur+Anjanath'],
  'Lumu Phantasm α+':    ['Phantom+Lunastra+Armor+Set', 'Lumu+Phantasm+Armor+Set', 'Lunastra+Phantasm'],
  'Lumu Phantasm β+':    ['Phantom+Lunastra+Armor+Set', 'Lumu+Phantasm+Armor+Set', 'Lunastra+Phantasm'],
  'Shrieking Legia α+':  ['Shrieking+Legiana+Armor+Set', 'Shrieking+Legiana'],
  'Shrieking Legia β+':  ['Shrieking+Legiana+Armor+Set', 'Shrieking+Legiana'],
  'Death Garon α+':      ['Death+Garon+Armor+Set', 'Death+Odogaron+Armor+Set', 'Death+Odogaron'],
  'Death Garon β+':      ['Death+Garon+Armor+Set', 'Death+Odogaron+Armor+Set', 'Death+Odogaron'],
  'Brute Tigrex α+':     ['Brute+Tigrex+Armor+Set', 'Brute+Tigrex'],
  'Brute Tigrex β+':     ['Brute+Tigrex+Armor+Set', 'Brute+Tigrex'],
  'Black Belt α+':       ['Black+Belt+Armor+Set', 'Black+Belt'],
  'Black Belt β+':       ['Black+Belt+Armor+Set', 'Black+Belt'],
  'Seething Bazel α+':   ['Seething+Bazelgeuse+Armor+Set', 'Seething+Bazelgeuse'],
  'Seething Bazel β+':   ['Seething+Bazelgeuse+Armor+Set', 'Seething+Bazelgeuse'],
  'Savage Jho α+':       ['Savage+Deviljho+Armor+Set', 'Savage+Deviljho'],
  'Savage Jho β+':       ['Savage+Deviljho+Armor+Set', 'Savage+Deviljho'],
  'Blackveil Hazak α+':  ['Blackveil+Vaal+Hazak+Armor+Set', 'Blackveil+Vaal+Hazak'],
  'Blackveil Hazak β+':  ['Blackveil+Vaal+Hazak+Armor+Set', 'Blackveil+Vaal+Hazak'],
  'Guild Palace α+':     ['Guild+Palace+Armor+Set', 'Guild+Palace'],
  'Guild Palace β+':     ['Guild+Palace+Armor+Set', 'Guild+Palace'],
  'Shara Ishvalda α+':   ['Shara+Ishvalda+Armor+Set', 'Shara+Ishvalda'],
  'Shara Ishvalda β+':   ['Shara+Ishvalda+Armor+Set', 'Shara+Ishvalda'],
  'Golden Lune α+':      ['Golden+Lune+Armor+Set', 'Rathian+Golden+Armor+Set', 'Golden+Lune'],
  'Golden Lune β+':      ['Golden+Lune+Armor+Set', 'Rathian+Golden+Armor+Set', 'Golden+Lune'],
  'Silver Sol α+':       ['Silver+Sol+Armor+Set', 'Rathalos+Silver+Armor+Set', 'Silver+Sol'],
  'Silver Sol β+':       ['Silver+Sol+Armor+Set', 'Rathalos+Silver+Armor+Set', 'Silver+Sol'],
  'Ruiner Nergi α+':     ['Ruiner+Nergigante+Armor+Set', 'Ruiner+Nergigante'],
  'Ruiner Nergi β+':     ['Ruiner+Nergigante+Armor+Set', 'Ruiner+Nergigante'],
  'Guildwork α+':        ['Guildwork+Armor+Set', 'Guildwork'],
  'Guildwork β+':        ['Guildwork+Armor+Set', 'Guildwork'],
  'Furious Rajang α+':   ['Furious+Rajang+Armor+Set', 'Furious+Rajang'],
  'Furious Rajang β+':   ['Furious+Rajang+Armor+Set', 'Furious+Rajang'],
  'Stygian Zin α+':      ['Stygian+Zinogre+Armor+Set', 'Stygian+Zinogre'],
  'Stygian Zin β+':      ['Stygian+Zinogre+Armor+Set', 'Stygian+Zinogre'],
  "Safi'jiiva α+":       ["Safi'jiiva+Armor+Set", "Safi'jiiva"],
  "Safi'jiiva β+":       ["Safi'jiiva+Armor+Set", "Safi'jiiva"],
  'Raging Brachy α+':    ['Raging+Brachydios+Armor+Set', 'Raging+Brachydios'],
  'Raging Brachy β+':    ['Raging+Brachydios+Armor+Set', 'Raging+Brachydios'],
  'Artian α+':           ['Artian+Armor+Set', 'Artian'],
  'Artian β+':           ['Artian+Armor+Set', 'Artian'],
  'Clockwork α+':        ['Clockwork+Armor+Set', 'Clockwork'],
  'Clockwork β+':        ['Clockwork+Armor+Set', 'Clockwork'],
  // Event/Layered sets
  'Oolong α+':           ['Oolong+Armor+Set', 'Oolong'],
  'Astral α+':           ['Astral+Armor+Set', 'Astral'],
  'Rose α+':             ['Rose+Armor+Set', 'Rose'],
  'Passionate α+':       ['Passionate+Armor+Set', 'Passionate'],
  'Demonlord α+':        ['Demonlord+Armor+Set', 'Demonlord'],
  'Dragon α+':           ['Dragon+Armor+Set', 'Dragon'],
  'Dragon β+':           ['Dragon+Armor+Set', 'Dragon'],
  'Azure Age α+':        ['Azure+Age+Armor+Set', 'Azure+Age'],
  'Artemis α+':          ['Artemis+Armor+Set', 'Artemis'],
  'Pearlspring α+':      ['Pearlspring+Armor+Set', 'Pearlspring'],
  'Duffel Penguin Mask α+': ['Duffel+Penguin+Mask', 'Duffel+Penguin'],
  'Sealed Dragon Cloth α+': ['Sealed+Dragon+Cloth', 'Sealed+Dragon'],
  'Wyverian Ears α+':    ['Wyverian+Ears+Armor+Set', 'Wyverian+Ears'],
}

function buildPageList(setName) {
  // Usa override se existir
  if (PAGE_OVERRIDES[setName]) return PAGE_OVERRIDES[setName]

  // Fallback: nome base sem tier
  const base = setName
    .replace(/\s*α\+?/gi, '').replace(/\s*β\+?/gi, '').replace(/\s*γ\+?/gi, '')
    .trim().replace(/ /g, '+')

  return [
    `${base}+Armor+Set`,
    `${base}+Alpha+Plus+Armor+Set`,
    base,
  ]
}

async function main() {
  const armor = JSON.parse(await readFile(ARMOR_EN, 'utf-8'))
  await mkdir(`${OUT}/sets`, { recursive: true })

  const existingIds = new Set(
    (await import('node:fs')).default.readdirSync(`${OUT}/sets`).map(f => parseInt(f))
  )
  const missing = armor.filter(a => !existingIds.has(a.id))
  console.log(`Sets faltando: ${missing.length}\n`)

  let ok = 0, fail = 0
  const failed = []

  for (const set of missing) {
    const dest = `${OUT}/sets/${set.id}.png`
    process.stdout.write(`[${set.id}] ${set.name} ... `)

    const pages = buildPageList(set.name)
    let imgs = []
    for (const page of pages) {
      imgs = await fetchImages(page)
      if (imgs.length) break
      await sleep(200)
    }

    // Prioriza imagens de set
    const sorted = [...imgs.filter(f => f.includes('set')), ...imgs.filter(f => !f.includes('set'))]
    let found = false
    for (const img of sorted) {
      if (await downloadPng(`${FILE_BASE}/${img}`, dest)) {
        console.log(`✓ ${img.slice(0, 58)}`)
        found = true; ok++; break
      }
    }

    if (!found) {
      const info = imgs.length ? `(${imgs.length} candidatas, nenhuma válida)` : '(página não encontrada)'
      console.log(`✗ ${info}`)
      failed.push(`[${set.id}] ${set.name}`)
      fail++
    }

    await sleep(DELAY)
  }

  console.log(`\n✓ Baixados: ${ok}  ✗ Não encontrados: ${fail}`)
  if (failed.length) {
    console.log('\nAinda faltando:')
    failed.forEach(s => console.log(' ', s))
  }
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
