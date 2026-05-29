/**
 * Gera os snapshots de armas e armaduras globais.
 * Enriquece armas com:
 *   - previousWeaponId  (weapon_base.csv)
 *   - craftMaterials    (weapon_craft.csv, type=Create)
 *   - upgradeMaterials  (weapon_craft.csv, type=Upgrade)
 *   nomes de materiais traduzidos via items-{lang}.json já existentes em /data/
 *
 * Pré-requisito: backend Spring rodando em http://localhost:8080
 * Uso: node scripts/generate-equipment-snapshot.mjs
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, resolve }           from 'node:path'
import { fileURLToPath }              from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const API   = 'http://localhost:8080/api'
const OUT   = resolve(__dirname, '../frontend/public/data')
const LANGS = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'zh']

const WEAPON_BASE_CSV  = resolve(__dirname, '../mhdata/source_data/weapons/weapon_base.csv')
const WEAPON_CRAFT_CSV = resolve(__dirname, '../mhdata/source_data/weapons/weapon_craft.csv')

// ── CSV parser simples ─────────────────────────────────────────────────────
function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split('\n')
  const headers = headerLine.split(',')
  return lines.map(line => {
    const vals = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? '').trim()]))
  })
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.json()
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(data))
  process.stdout.write('.')
}

// ── Lê weapon_base.csv → mapas id→prevId e nameEn→id ──────────────────────
async function loadWeaponBase() {
  const rows     = parseCsv(await readFile(WEAPON_BASE_CSV, 'utf-8'))
  const nameToId = new Map(rows.map(r => [r.name_en, Number(r.id)]))
  const prevMap  = new Map(
    rows.map(r => [
      Number(r.id),
      r.previous_en ? (nameToId.get(r.previous_en) ?? null) : null,
    ])
  )
  return { nameToId, prevMap }
}

// ── Lê weapon_craft.csv → id→{ craftItems, upgradeItems }  ────────────────
// craftItems / upgradeItems = [{ itemNameEn, quantity }]
async function loadWeaponCraft(nameToId) {
  const rows = parseCsv(await readFile(WEAPON_CRAFT_CSV, 'utf-8'))
  const map  = new Map() // weaponId → { craftItems: [], upgradeItems: [] }

  for (const row of rows) {
    const weaponId = nameToId.get(row.base_name_en)
    if (!weaponId) continue
    if (!map.has(weaponId)) map.set(weaponId, { craftItems: [], upgradeItems: [] })
    const entry = map.get(weaponId)

    const items = []
    for (let i = 1; i <= 4; i++) {
      const name = row[`item${i}_name`]
      const qty  = Number(row[`item${i}_qty`])
      if (name && qty > 0) items.push({ itemNameEn: name, quantity: qty })
    }

    if (row.type === 'Create') entry.craftItems   = items
    else                       entry.upgradeItems  = items
  }

  return map
}

// ── Lê items-{lang}.json → Map<itemNameEn, { id, name }> ──────────────────
async function loadItemsForLang(lang) {
  // Primeiro carrega en para ter o mapa nameEn→id
  const itemsEn   = JSON.parse(await readFile(resolve(OUT, 'items-en.json'), 'utf-8'))
  const idToEn    = new Map(itemsEn.map(it => [it.id, it.name]))  // id → nameEn
  const enToId    = new Map(itemsEn.map(it => [it.name, it.id]))  // nameEn → id

  if (lang === 'en') {
    // nameEn → { id, name }
    return new Map(itemsEn.map(it => [it.name, { id: it.id, name: it.name }]))
  }

  const itemsLang = JSON.parse(
    await readFile(resolve(OUT, `items-${lang}.json`), 'utf-8').catch(() => '[]')
  )
  const idToName  = new Map(itemsLang.map(it => [it.id, it.name]))

  // Constrói mapa nameEn → { id, name_traduzido }
  const result = new Map()
  for (const [nameEn, id] of enToId) {
    result.set(nameEn, { id, name: idToName.get(id) ?? nameEn })
  }
  return result
}

// ── Enriquece armas com previousWeaponId + craftMaterials + upgradeMaterials
function enrichWeapons(weapons, prevMap, craftMap, itemMap) {
  return weapons.map(w => {
    const craft   = craftMap.get(w.id) ?? { craftItems: [], upgradeItems: [] }

    const toMats = items => items.map(({ itemNameEn, quantity }) => {
      const item = itemMap.get(itemNameEn)
      return { itemId: item?.id ?? null, name: item?.name ?? itemNameEn, quantity }
    })

    return {
      ...w,
      previousWeaponId:  prevMap.get(w.id) ?? null,
      craftMaterials:    toMats(craft.craftItems),
      upgradeMaterials:  toMats(craft.upgradeItems),
    }
  })
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('Carregando mapas de enriquecimento...')
  const { nameToId, prevMap } = await loadWeaponBase()
  const craftMap = await loadWeaponCraft(nameToId)
  console.log(`  ${prevMap.size} armas / ${craftMap.size} receitas encontradas\n`)

  console.log('Gerando weapons e armor por idioma:')
  for (const lang of LANGS) {
    process.stdout.write(`  [${lang}] `)

    const [weapons, armor, itemMap] = await Promise.all([
      fetchJson(`${API}/weapons?lang=${lang}`),
      fetchJson(`${API}/armor?lang=${lang}`),
      loadItemsForLang(lang),
    ])

    const enriched = enrichWeapons(weapons, prevMap, craftMap, itemMap)

    await Promise.all([
      writeJson(`${OUT}/weapons-${lang}.json`, enriched),
      writeJson(`${OUT}/armor-${lang}.json`, armor),
    ])
    console.log()
  }

  // Verifica um exemplo
  const sample = JSON.parse(await readFile(resolve(OUT, 'weapons-pt.json'), 'utf-8'))
  const withUpgrade = sample.filter(w => w.upgradeMaterials?.length > 0)
  const withCraft   = sample.filter(w => w.craftMaterials?.length > 0)
  console.log(`\nVerificação (PT):`)
  console.log(`  craftMaterials   presentes: ${withCraft.length}`)
  console.log(`  upgradeMaterials presentes: ${withUpgrade.length}`)
  const ex = sample.find(w => w.name?.includes('Forte'))
  if (ex) console.log(`  Exemplo "${ex.name}": craft=${ex.craftMaterials?.length ?? 0} upgrade=${ex.upgradeMaterials?.length ?? 0}`)

  console.log('\nPronto!')
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
