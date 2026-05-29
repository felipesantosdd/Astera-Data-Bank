/**
 * Baixa os ícones SVG oficiais de armas do repositório OthelloRhin/MHW_Icons_SVG.
 * Salva em frontend/public/weapons/{type}/rank_{rarity}.svg
 *
 * Uso: node scripts/download-weapon-icons.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT  = resolve(__dirname, '../frontend/public/weapons')
const BASE = 'https://raw.githubusercontent.com/OthelloRhin/MHW_Icons_SVG/master/SVG/Weapons'

// Mapeamento: weapon_type → nome da pasta no repositório
const WEAPON_FOLDERS = {
  'great-sword':      'Great_Sword',
  'long-sword':       'Long_Sword',
  'sword-and-shield': 'Sword_%26_Shield',
  'dual-blades':      'Dual_Blades',
  'hammer':           'Hammer',
  'hunting-horn':     'Hunting_Horn',
  'lance':            'Lance',
  'gunlance':         'Gunlance',
  'switch-axe':       'Switch_Axe',
  'charge-blade':     'Charge_Blade',
  'insect-glaive':    'Insect_Glaive',
  'light-bowgun':     'Light_Bowgun',
  'heavy-bowgun':     'Heavy_Bowgun',
  'bow':              'Bow',
}

// Nome do arquivo no repositório: {FolderName}_Rank_01.svg (sem encoding)
const WEAPON_NAMES = {
  'great-sword':      'Great_Sword',
  'long-sword':       'Long_Sword',
  'sword-and-shield': 'Sword_&_Shield',
  'dual-blades':      'Dual_Blades',
  'hammer':           'Hammer',
  'hunting-horn':     'Hunting_Horn',
  'lance':            'Lance',
  'gunlance':         'Gunlance',
  'switch-axe':       'Switch_Axe',
  'charge-blade':     'Charge_Blade',
  'insect-glaive':    'Insect_Glaive',
  'light-bowgun':     'Light_Bowgun',
  'heavy-bowgun':     'Heavy_Bowgun',
  'bow':              'Bow',
}

async function download(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  const text = await res.text()
  await mkdir(dirname(dest), { recursive: true })
  await writeFile(dest, text)
}

async function main() {
  let total = 0
  let errors = 0

  for (const [type, folder] of Object.entries(WEAPON_FOLDERS)) {
    const name = WEAPON_NAMES[type]
    process.stdout.write(`  ${type.padEnd(20)}`)

    for (let rank = 1; rank <= 12; rank++) {
      const rankStr  = String(rank).padStart(2, '0')
      const filename = `${name}_Rank_${rankStr}.svg`
      const url      = `${BASE}/${folder}/${encodeURIComponent(filename)}`
      const dest     = resolve(OUT, type, `rank_${rankStr}.svg`)

      try {
        await download(url, dest)
        process.stdout.write('.')
        total++
      } catch (e) {
        process.stdout.write('x')
        errors++
      }
    }
    console.log()
  }

  console.log(`\nPronto! ${total} ícones baixados, ${errors} erros.`)
}

main().catch(err => { console.error('Erro:', err); process.exit(1) })
