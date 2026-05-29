/**
 * Gera/atualiza sources-{lang}.json para consumíveis.
 *
 * Para cada consumível:
 *   - gathering  → de location_items.csv  (ervas, cogumelos, etc.)
 *   - combinations → de item_combination_list.csv (receitas de combinação)
 *
 * Se o item já tiver pasta em /data/items/{id}/, mescla (mantém rewards/quests existentes
 * e adiciona/sobrescreve gathering + combinations).
 * Se não tiver pasta, cria do zero.
 *
 * Uso: node scripts/generate-consumable-sources.mjs
 */

import { readFile, mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, resolve }                   from 'node:path'
import { fileURLToPath }                      from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const DATA_SRC  = resolve(ROOT, 'mhdata/source_data')
const OUT       = resolve(ROOT, 'frontend/public/data/items')

const LANGS = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'zh']

// ── CSV parser com suporte a campos entre aspas ──────────────────────────────
function parseCsv(text) {
  const lines = []
  let cur = []
  let field = ''
  let inQuote = false
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inQuote) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue }
      if (ch === '"') { inQuote = false; i++; continue }
      field += ch
    } else {
      if (ch === '"') { inQuote = true; i++; continue }
      if (ch === ',') { cur.push(field); field = ''; i++; continue }
      if (ch === '\n' || ch === '\r') {
        cur.push(field); field = ''
        if (cur.some(f => f !== '')) lines.push(cur)
        cur = []
        if (ch === '\r' && text[i + 1] === '\n') i++
        i++; continue
      }
      field += ch
    }
    i++
  }
  if (field || cur.length) { cur.push(field); if (cur.some(f => f !== '')) lines.push(cur) }
  const [headers, ...rows] = lines
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

async function exists(path) {
  try { await access(path); return true } catch { return false }
}

// ── Carrega CSVs ─────────────────────────────────────────────────────────────
async function loadData() {
  const [itemBaseCsv, transCsv, locationItemsCsv, locationBaseCsv, comboCsv] =
    await Promise.all([
      readFile(`${DATA_SRC}/items/item_base.csv`,                  'utf-8'),
      readFile(`${DATA_SRC}/items/item_base_translations.csv`,     'utf-8'),
      readFile(`${DATA_SRC}/locations/location_items.csv`,         'utf-8'),
      readFile(`${DATA_SRC}/locations/location_base.csv`,          'utf-8'),
      readFile(`${DATA_SRC}/items/item_combination_list.csv`,      'utf-8'),
    ])

  return {
    items:         parseCsv(itemBaseCsv),
    translations:  parseCsv(transCsv),
    locationItems: parseCsv(locationItemsCsv),
    locations:     parseCsv(locationBaseCsv),
    combos:        parseCsv(comboCsv),
  }
}

// ── Índices úteis ─────────────────────────────────────────────────────────────
function buildIndexes({ items, translations, locationItems, locations, combos }) {
  // name_en → item row
  const itemByName = {}
  items.forEach(r => { itemByName[r.name_en] = r })

  // name_en → translations row
  const transByName = {}
  translations.forEach(r => { transByName[r.name_en] = r })

  // location base_name_en → location row (com translations)
  const locationByName = {}
  locations.forEach(r => { locationByName[r.name_en] = r })

  // item name_en → lista de gathering rows
  const gatherByItem = {}
  locationItems.forEach(row => {
    if (row.item_lang !== 'en') return  // apenas linhas em inglês
    const name = row.item
    if (!gatherByItem[name]) gatherByItem[name] = []
    gatherByItem[name].push(row)
  })

  // item name_en (resultado) → lista de combos que produzem esse item
  const comboByResult = {}
  combos.forEach(c => {
    const res = c.result
    if (!comboByResult[res]) comboByResult[res] = []
    comboByResult[res].push(c)
  })

  // item name_en (ingrediente) → lista de combos que usam esse item
  const comboByIngredient = {}
  combos.forEach(c => {
    ;[c.first, c.second].forEach(ing => {
      if (!ing) return
      if (!comboByIngredient[ing]) comboByIngredient[ing] = []
      comboByIngredient[ing].push(c)
    })
  })

  return { itemByName, transByName, locationByName, gatherByItem, comboByResult, comboByIngredient }
}

// ── Monta gathering para um item num idioma ──────────────────────────────────
function buildGathering(nameEn, { gatherByItem, locationByName, transByName }, lang) {
  const rows = gatherByItem[nameEn] ?? []

  return rows.map(row => {
    const loc     = locationByName[row.base_name_en] ?? {}
    const langKey = `name_${lang}`
    const locName = loc[langKey] || loc['name_en'] || row.base_name_en

    return {
      locationId:   Number(loc.id) || null,
      locationName: locName,
      area:         Number(row.area) || null,
      rank:         row.rank || null,      // 'LR', 'HR', ou null (todos os ranks)
      stack:        Number(row.stack) || 1,
      percentage:   Number(row.percentage) || null,
      nodes:        row.nodes !== '' ? Number(row.nodes) : null,
    }
  }).sort((a, b) => {
    // Ordena: rank (LR→HR→null), depois localização, depois área
    const rankOrd = { LR: 0, HR: 1, null: 2 }
    const ra = rankOrd[a.rank] ?? 2
    const rb = rankOrd[b.rank] ?? 2
    if (ra !== rb) return ra - rb
    return (a.locationName ?? '').localeCompare(b.locationName ?? '')
  })
}

// ── Monta combinations para um item num idioma ───────────────────────────────
function buildCombinations(nameEn, { comboByResult, comboByIngredient, itemByName, transByName }, lang) {
  const langKey = `name_${lang}`

  function translateItem(nameEn) {
    if (!nameEn) return null
    const t = transByName[nameEn]
    return (t && t[langKey]) ? t[langKey] : nameEn
  }

  // Receitas que PRODUZEM este item
  const produces = (comboByResult[nameEn] ?? []).map(c => ({
    type:       'recipe',
    resultName: translateItem(c.result),
    first:      translateItem(c.first),
    firstId:    c.first ? Number(itemByName[c.first]?.id) || null : null,
    second:     c.second ? translateItem(c.second) : null,
    secondId:   c.second ? Number(itemByName[c.second]?.id) || null : null,
    quantity:   Number(c.quantity) || 1,
  }))

  // Receitas em que este item É INGREDIENTE
  const usedIn = (comboByIngredient[nameEn] ?? []).map(c => ({
    type:       'usedIn',
    resultName: translateItem(c.result),
    resultId:   Number(itemByName[c.result]?.id) || null,
    first:      translateItem(c.first),
    firstId:    c.first ? Number(itemByName[c.first]?.id) || null : null,
    second:     c.second ? translateItem(c.second) : null,
    secondId:   c.second ? Number(itemByName[c.second]?.id) || null : null,
    quantity:   Number(c.quantity) || 1,
  }))

  return { produces, usedIn }
}

// ── Processa um consumível ────────────────────────────────────────────────────
async function processItem(itemRow, indexes, lang) {
  const id     = Number(itemRow.id)
  const nameEn = itemRow.name_en
  const dir    = `${OUT}/${id}`

  // Carrega sources existentes (se houver) ou cria estrutura vazia
  let existing = { rewards: [], gathering: [], quests: [] }
  const srcFile = `${dir}/sources-${lang}.json`
  if (await exists(srcFile)) {
    existing = JSON.parse(await readFile(srcFile, 'utf-8'))
  }

  const gathering    = buildGathering(nameEn, indexes, lang)
  const combinations = buildCombinations(nameEn, indexes, lang)

  const sources = {
    rewards:      existing.rewards  ?? [],
    gathering:    gathering,
    quests:       existing.quests   ?? [],
    combinations,
  }

  await mkdir(dir, { recursive: true })
  await writeFile(srcFile, JSON.stringify(sources))
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Carregando dados...')
  const data    = await loadData()
  const indexes = buildIndexes(data)

  // Carrega lista de consumíveis (usa o JSON em inglês como referência de IDs)
  const consumables = JSON.parse(
    await readFile(resolve(ROOT, 'frontend/public/data/consumables-en.json'), 'utf-8')
  )
  const consumableIds = new Set(consumables.map(c => c.id))

  // Adiciona ingredientes de combinações que NÃO são consumíveis
  const ingredientIds = new Set()
  data.combos.forEach(c => {
    ;[c.first, c.second].forEach(ing => {
      if (!ing) return
      const item = indexes.itemByName[ing]
      if (item && !consumableIds.has(Number(item.id))) {
        ingredientIds.add(Number(item.id))
      }
    })
    // Também inclui os resultados (para navegação reversa)
    const res = indexes.itemByName[c.result]
    if (res && !consumableIds.has(Number(res.id))) {
      ingredientIds.add(Number(res.id))
    }
  })

  // Itens a processar = consumíveis + ingredientes extras
  const allItemIds = [...consumableIds, ...ingredientIds]
  const allItems   = data.items.filter(r => allItemIds.includes(Number(r.id)))
  console.log(`Consumíveis: ${consumables.length}  |  Ingredientes extras: ${ingredientIds.size}  |  Total: ${allItems.length}`)

  // Para cada idioma, processa todos os itens
  for (const lang of LANGS) {
    let count = 0
    for (const itemRow of allItems) {
      await processItem(itemRow, indexes, lang)
      count++
    }
    console.log(`  ✓ ${lang}: ${count} items`)
  }

  console.log('\nPronto!')

  // Estatísticas
  let withGather = 0
  let withRecipe = 0
  let withUsedIn = 0
  const enFile = (id) => `${OUT}/${id}/sources-en.json`
  for (const c of consumables) {
    try {
      const d = JSON.parse(await readFile(enFile(c.id), 'utf-8'))
      if (d.gathering?.length)             withGather++
      if (d.combinations?.produces?.length) withRecipe++
      if (d.combinations?.usedIn?.length)  withUsedIn++
    } catch {}
  }
  console.log(`\nEstatísticas (en):`)
  console.log(`  Com coleta em mapa:  ${withGather}`)
  console.log(`  Com receita própria: ${withRecipe}`)
  console.log(`  Usado como ingrediente: ${withUsedIn}`)
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
