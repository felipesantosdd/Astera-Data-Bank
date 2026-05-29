/**
 * Gera consumables-{lang}.json a partir dos CSVs de itens do mhdata.
 * Inclui ervas, cogumelos, sementes, mel e itens naturais de coleta.
 *
 * Uso: node scripts/generate-consumables-snapshot.mjs
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve }           from 'node:path'
import { fileURLToPath }              from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT  = resolve(__dirname, '../frontend/public/data')
const BASE = resolve(__dirname, '../mhdata/source_data/items')

const LANGS = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'zh']

// Ícones de consumíveis/naturais
const NATURAL_ICONS = new Set(['Herb', 'Mushroom', 'Seed', 'Honey', 'Bait'])
// Ícones de itens de campo/utilitários
const UTILITY_ICONS = new Set(['Liquid', 'Pellets', 'Meat', 'Sac', 'Barrel', 'BarrelBomb', 'Trap', 'TrapTool', 'Smoke', 'Dung'])

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split('\n')
  const headers = headerLine.split(',')
  return lines.map(line => {
    const vals = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? '').trim()]))
  })
}

async function main() {
  const baseCsv   = parseCsv(await readFile(`${BASE}/item_base.csv`, 'utf-8'))
  const transCsv  = parseCsv(await readFile(`${BASE}/item_base_translations.csv`, 'utf-8'))

  // Filtra consumíveis: itens naturais + utilidade de campo
  const consumables = baseCsv.filter(r =>
    NATURAL_ICONS.has(r.icon_name) || UTILITY_ICONS.has(r.icon_name),
  )

  console.log(`Consumíveis encontrados: ${consumables.length}`)

  // Mapeia name_en → traduções por idioma
  const transByName = {}
  for (const row of transCsv) {
    transByName[row.name_en] = row
  }

  await mkdir(OUT, { recursive: true })

  for (const lang of LANGS) {
    const langKey = `name_${lang}`

    const items = consumables.map(r => {
      const trans = transByName[r.name_en] ?? {}
      const name  = (trans[langKey] && trans[langKey] !== '') ? trans[langKey] : r.name_en

      return {
        id:          Number(r.id),
        name,
        rarity:      Number(r.rarity) || 1,
        iconName:    r.icon_name,
        iconColor:   r.icon_color,
        category:    'consumable',
        subcategory: null,
      }
    })

    await writeFile(`${OUT}/consumables-${lang}.json`, JSON.stringify(items))
    console.log(`  ✓ consumables-${lang}.json (${items.length} items)`)
  }

  console.log('\nPronto!')
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
