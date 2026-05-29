/**
 * Gera o snapshot estático dos dados consultando o backend rodando localmente.
 * Os JSONs gerados ficam em frontend/public/data/ e são consumidos diretamente
 * em produção (sem backend rodando).
 *
 * Pré-requisitos:
 *   - Backend Spring rodando em http://localhost:8080
 *   - Node 18+ (precisa de fetch nativo)
 *
 * Uso:
 *   node scripts/generate-snapshot.mjs
 */

import { mkdir, writeFile, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ─── Configuração ─────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const API   = 'http://localhost:8080/api'
const OUT   = resolve(__dirname, '../frontend/public/data')
const LANGS = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'zh']
const CONCURRENCY = 8  // requests em paralelo por monstro/item

// ─── Helpers ──────────────────────────────────────────────────────────
async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.json()
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(data))
}

// Pool simples de paralelismo
async function pool(items, worker, concurrency = CONCURRENCY) {
  const queue = [...items]
  const runners = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()
      if (item !== undefined) await worker(item)
    }
  })
  await Promise.all(runners)
}

// ─── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`Limpando ${OUT}...`)
  await rm(OUT, { recursive: true, force: true })

  // ── Monstros ──
  console.log('Gerando listas de monstros...')
  const monstersByLang = {}
  for (const lang of LANGS) {
    const list = await fetchJson(`${API}/monsters?lang=${lang}`)
    await writeJson(`${OUT}/monsters-${lang}.json`, list)
    monstersByLang[lang] = list
  }
  const monsters = monstersByLang.en
  console.log(`  ${monsters.length} monstros × ${LANGS.length} idiomas`)

  console.log('Gerando detalhes, armaduras e drops por monstro...')
  const itemIds = new Set()
  let done = 0

  for (const m of monsters) {
    await pool(LANGS, async (lang) => {
      const detail = await fetchJson(`${API}/monsters/${m.id}?lang=${lang}`)
      await writeJson(`${OUT}/monsters/${m.id}/${lang}.json`, detail)

      const armor = await fetchJson(`${API}/monsters/${m.id}/armor?lang=${lang}`)
      await writeJson(`${OUT}/monsters/${m.id}/armor-${lang}.json`, armor)

      const drops = await fetchJson(`${API}/monsters/${m.id}/drops?lang=${lang}`)
      await writeJson(`${OUT}/monsters/${m.id}/drops-${lang}.json`, drops)

      if (lang === 'en') {
        for (const set of armor) {
          for (const piece of set.pieces) {
            for (const mat of piece.materials) itemIds.add(mat.itemId)
          }
        }
        for (const d of drops) itemIds.add(d.itemId)
      }
    })
    done++
    if (done % 10 === 0 || done === monsters.length) {
      console.log(`  ${done}/${monsters.length} monstros`)
    }
  }

  // ── Armaduras global ──
  console.log('Gerando listagem global de armaduras...')
  await pool(LANGS, async (lang) => {
    const armor = await fetchJson(`${API}/armor?lang=${lang}`)
    await writeJson(`${OUT}/armor-${lang}.json`, armor)
    if (lang === 'en') {
      for (const set of armor) {
        for (const piece of set.pieces) {
          for (const mat of piece.materials) itemIds.add(mat.itemId)
        }
      }
    }
  })
  console.log(`  ${LANGS.length} idiomas`)

  // ── Armas ──
  console.log('Gerando listagem de armas...')
  await pool(LANGS, async (lang) => {
    const weapons = await fetchJson(`${API}/weapons?lang=${lang}`)
    await writeJson(`${OUT}/weapons-${lang}.json`, weapons)
    if (lang === 'en') {
      for (const w of weapons) {
        for (const mat of w.craftMaterials ?? []) itemIds.add(mat.itemId)
      }
    }
  })
  console.log(`  ${LANGS.length} idiomas`)

  // ── Items (sources) ──
  console.log(`Itens únicos encontrados: ${itemIds.size}`)
  console.log('Gerando sources de cada item...')
  done = 0
  const itemList = [...itemIds]

  for (const itemId of itemList) {
    await pool(LANGS, async (lang) => {
      const sources = await fetchJson(`${API}/items/${itemId}/sources?lang=${lang}`)
      await writeJson(`${OUT}/items/${itemId}/sources-${lang}.json`, sources)
    })
    done++
    if (done % 100 === 0 || done === itemList.length) {
      console.log(`  ${done}/${itemList.length} itens`)
    }
  }

  console.log(`\nSnapshot pronto em ${OUT}/`)
}

main().catch((err) => {
  console.error('Erro:', err)
  process.exit(1)
})
