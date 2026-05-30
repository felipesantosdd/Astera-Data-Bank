/**
 * Gera quests-{lang}.json para o frontend
 * Inclui: assigned, optional, special (exclui event, arena, challenge)
 */
const fs   = require('fs')
const path = require('path')

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim())
  const headers = parseRow(lines[0])
  return lines.slice(1).map(l => {
    const vals = parseRow(l)
    const obj  = {}
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim() })
    return obj
  })
}

function parseRow(line) {
  const cols = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { inQ = !inQ }
    else if (c === ',' && !inQ) { cols.push(cur); cur = '' }
    else cur += c
  }
  cols.push(cur)
  return cols
}

const QUEST_DIR = path.join(__dirname, '../mhdata/source_data/quests')
const ITEM_DIR  = path.join(__dirname, '../mhdata/source_data/items')
const OUT_DIR   = path.join(__dirname, '../frontend/public/data')

// ── Monster ID lookup (EN name → ID) ─────────────────────────────────────────
const monstersEn = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'monsters-en.json'), 'utf8'))
const monsterIdByEnName = {}
for (const m of monstersEn) monsterIdByEnName[m.name.toLowerCase()] = m.id

// ── Item name translations (EN name → { lang: localizedName }) ────────────────
// item_base_translations.csv: name_en, description_en, name_ja, ..., name_pt, ...
// No id column — keyed by name_en
const itemTransCSV = parseCSV(fs.readFileSync(path.join(ITEM_DIR, 'item_base_translations.csv'), 'utf8'))
const itemNameByEnAndLang = {}  // itemNameByEnAndLang['Potion']['pt'] = 'Poção'
for (const row of itemTransCSV) {
  const enName = row['name_en']
  if (!enName) continue
  itemNameByEnAndLang[enName.toLowerCase()] = {}
  for (const key of Object.keys(row)) {
    if (key.startsWith('name_')) {
      const lang = key.replace('name_', '')
      if (row[key]) itemNameByEnAndLang[enName.toLowerCase()][lang] = row[key]
    }
  }
}

function getItemName(enName, lang) {
  const entry = itemNameByEnAndLang[enName.toLowerCase()]
  if (!entry) return enName
  return entry[lang] || entry['en'] || enName
}

// ── Load quest CSVs ───────────────────────────────────────────────────────────
const questBase    = parseCSV(fs.readFileSync(path.join(QUEST_DIR, 'quest_base.csv'), 'utf8'))
const translations = parseCSV(fs.readFileSync(path.join(QUEST_DIR, 'quest_base_translations.csv'), 'utf8'))
const qMonsters    = parseCSV(fs.readFileSync(path.join(QUEST_DIR, 'quest_monsters.csv'), 'utf8'))
const qRewards     = parseCSV(fs.readFileSync(path.join(QUEST_DIR, 'quest_rewards.csv'), 'utf8'))

const INCLUDE_CATS = new Set(['assigned', 'optional', 'special'])
const filtered     = questBase.filter(q => INCLUDE_CATS.has(q.category))
const filteredIds  = new Set(filtered.map(q => q.id))

const transById = {}
for (const t of translations) { if (filteredIds.has(t.id)) transById[t.id] = t }

const monstersById = {}
for (const m of qMonsters) {
  if (!filteredIds.has(m.base_id)) continue
  if (!monstersById[m.base_id]) monstersById[m.base_id] = []
  monstersById[m.base_id].push({
    nameEn:      m.monster_en,
    monsterId:   monsterIdByEnName[m.monster_en.toLowerCase()] ?? null,
    quantity:    m.quantity ? Number(m.quantity) : null,
    isObjective: m.is_objective === 'TRUE',
  })
}

const rewardsRaw = {}
for (const r of qRewards) {
  if (!filteredIds.has(r.base_id)) continue
  if (!rewardsRaw[r.base_id]) rewardsRaw[r.base_id] = []
  rewardsRaw[r.base_id].push({
    group:      r.group,
    itemNameEn: r.item_en,
    stack:      Number(r.stack) || 1,
    percentage: Number(r.percentage) || 0,
  })
}

const LOC_MAP = {
  'Ancient Forest': 1, 'Wildspire Waste': 2, 'Coral Highlands': 3,
  "Rotten Vale": 4, "Elder's Recess": 5, 'Hoarfrost Reach': 6, 'Guiding Lands': 7,
}
const RANK_ORDER = { LR: 0, HR: 1, MR: 2 }
const CAT_ORDER  = { assigned: 0, special: 1, optional: 2 }
const LANGS = ['en', 'ja', 'fr', 'it', 'de', 'es', 'pt', 'pl', 'ru', 'ko', 'zh', 'ar']

console.log('Item translations loaded:', Object.keys(itemNameByEnAndLang).length)
// Quick check
const testPt = getItemName('Armor Sphere', 'pt')
const testPt2 = getItemName('Mysterious Feystone', 'pt')
console.log('Armor Sphere (pt):', testPt)
console.log('Mysterious Feystone (pt):', testPt2)

for (const lang of LANGS) {
  const monstersLang = JSON.parse(fs.readFileSync(path.join(OUT_DIR, `monsters-${lang}.json`), 'utf8'))
  const monsterNameById = {}
  for (const m of monstersLang) monsterNameById[m.id] = m.name

  const out = filtered.map(q => {
    const t = transById[q.id] || {}
    return {
      id:           Number(q.id),
      category:     q.category,
      rank:         q.rank,
      stars:        Number(q.stars) || null,
      questType:    q.quest_type,
      locationId:   LOC_MAP[q.location_en] ?? null,
      locationName: q.location_en,
      zenny:        Number(q.zenny) || 0,
      name:         t['name_' + lang]        || t['name_en']        || q.name_en,
      objective:    t['objective_' + lang]   || t['objective_en']   || '',
      description:  t['description_' + lang] || t['description_en'] || '',
      monsters: (monstersById[q.id] ?? []).map(m => ({
        ...m,
        name: m.monsterId ? (monsterNameById[m.monsterId] ?? m.nameEn) : m.nameEn,
      })),
      rewards: (rewardsRaw[q.id] ?? []).map(r => ({
        group:      r.group,
        itemName:   getItemName(r.itemNameEn, lang),
        stack:      r.stack,
        percentage: r.percentage,
      })),
    }
  }).sort((a, b) =>
    (RANK_ORDER[a.rank] ?? 9) - (RANK_ORDER[b.rank] ?? 9) ||
    (CAT_ORDER[a.category] ?? 9) - (CAT_ORDER[b.category] ?? 9) ||
    (a.stars || 0) - (b.stars || 0) ||
    a.id - b.id
  )

  fs.writeFileSync(path.join(OUT_DIR, `quests-${lang}.json`), JSON.stringify(out))
  console.log(`${lang}: ${out.length} quests — reward ex: "${out[0]?.rewards[1]?.itemName}"`)
}
