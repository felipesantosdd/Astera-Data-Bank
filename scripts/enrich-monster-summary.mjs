/**
 * Enriquece os arquivos monsters-{lang}.json com os campos ecology e elements,
 * lendo os JSONs de detalhe já existentes em public/data/monsters/{id}/{lang}.json.
 *
 * Uso: node scripts/enrich-monster-summary.mjs
 *
 * Não precisa do backend rodando — usa apenas os arquivos estáticos existentes.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA = resolve(__dirname, '../frontend/public/data')
const LANGS = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'zh']

/** Deriva os elementos ofensivos do monstro a partir dos ailments de blight */
function deriveElements(detail) {
  const el = []
  if (detail.ailmentFireblight)    el.push('fire')
  if (detail.ailmentWaterblight)   el.push('water')
  if (detail.ailmentThunderblight) el.push('thunder')
  if (detail.ailmentIceblight)     el.push('ice')
  if (detail.ailmentDragonblight)  el.push('dragon')
  if (detail.ailmentBlastblight)   el.push('blast')
  if (detail.ailmentPoison)        el.push('poison')
  if (detail.ailmentSleep)         el.push('sleep')
  if (detail.ailmentParalysis)     el.push('paralysis')
  return el
}

async function readJson(path) {
  const raw = await readFile(path, 'utf8')
  return JSON.parse(raw)
}

async function main() {
  for (const lang of LANGS) {
    const summaryPath = `${DATA}/monsters-${lang}.json`
    let summary

    try {
      summary = await readJson(summaryPath)
    } catch {
      console.warn(`  Skipping ${lang} (summary not found)`)
      continue
    }

    let enriched = 0
    const result = await Promise.all(summary.map(async m => {
      try {
        const detail = await readJson(`${DATA}/monsters/${m.id}/${lang}.json`)
        enriched++
        return {
          ...m,
          ecology:  detail.ecology  ?? null,
          elements: deriveElements(detail),
        }
      } catch {
        // detalhe não existe → mantém sem ecology/elements
        return { ...m, ecology: null, elements: [] }
      }
    }))

    await writeFile(summaryPath, JSON.stringify(result))
    console.log(`  monsters-${lang}.json — ${enriched}/${summary.length} enriched`)
  }
  console.log('\nDone.')
}

main().catch(e => { console.error(e); process.exit(1) })
