/**
 * Tradução das condições de drop (carve, break, investigation, etc).
 * Mesmo problema das partes de hitzone: o MHWorldData só tem em inglês.
 *
 * A função reconhece três padrões:
 *   - Match exato no dicionário base (ex: "Body Carve" → "Corte do Corpo")
 *   - "Break X" / "Wound X" — traduz prefixo + parte do corpo
 *   - "X (Y)" — traduz base + tier/cor entre parênteses
 */

const BASE_PT: Record<string, string> = {
  // Carves
  'Body Carve':            'Corte do Corpo',
  'Tail Carve':            'Corte da Cauda',
  'Head Shell Carve':      'Corte da Carapaça da Cabeça',
  'Horn Carve':            'Corte do Chifre',
  'Carve / Capture':       'Corte / Captura',
  'Gold Plating Carved':   'Banho de Ouro Cortado',

  // Diversos
  'Track':                 'Rastro',
  'Plunderblade':          'Plunderblade',
  'Palico Bonus':          'Bônus do Palico',
  'Bandit Mantle':         'Manto do Bandido',
  'Shiny Drop':            'Drop Cintilante',
  'Back Mining':           'Mineração nas Costas',
  'Red Crystal Mining / Shiny': 'Cristal Vermelho / Cintilante',
  'Siege Progress':        'Progresso do Cerco',
}

const PARTS_PT: Record<string, string> = {
  '1 Horn':            '1 Chifre',
  'Antennae':          'Antenas',
  'Back':              'Costas',
  'Beak':              'Bico',
  'Belly':             'Barriga',
  'Body':              'Corpo',
  'Chest':             'Peito',
  'Chest Shell':       'Carapaça do Peito',
  'Claws':             'Garras',
  'Fin':               'Nadadeira',
  'Forearms':          'Antebraços',
  'Forelegs':          'Patas Dianteiras',
  'Head':              'Cabeça',
  'Hindlegs':          'Patas Traseiras',
  'Horn':              'Chifre',
  'Horns':             'Chifres',
  'Jaw':               'Mandíbula',
  'Left Foreleg':      'Pata Dianteira Esquerda',
  'Left Hindleg':      'Pata Traseira Esquerda',
  'Left Leg Mantle':   'Manto da Perna Esquerda',
  'Left Wing':         'Asa Esquerda',
  'Left Wing Mantle':  'Manto da Asa Esquerda',
  'Legs':              'Pernas',
  'Neck Pouch':        'Bolsa do Pescoço',
  'Right Foreleg':     'Pata Dianteira Direita',
  'Right Hindleg':     'Pata Traseira Direita',
  'Right Leg Mantle':  'Manto da Perna Direita',
  'Right Wing':        'Asa Direita',
  'Right Wing Mantle': 'Manto da Asa Direita',
  'Tail':              'Cauda',
  'Wings':             'Asas',
}

// Sufixos entre parênteses (tier/cor da quest, dos cristais etc.)
const TIERS_PT: Record<string, string> = {
  Bronze:   'Bronze',
  Silver:   'Prata',
  Gold:     'Ouro',
  Purple:   'Roxa',
  Blue:     'Azul',
  Fury:     'Fúria',
  Low:      'Baixo',
  Mid:      'Médio',
  High:     'Alto',
  Tempered: 'Temperado',
}

// Bases das condições parametrizadas com "(X)"
const PAREN_BASE_PT: Record<string, string> = {
  Investigation:  'Investigação',
  Hunt:           'Caçada',
  Appraisal:      'Avaliação',
  'Guiding Lands':'Guiding Lands',
  'Siege Reward': 'Recompensa do Cerco',
}

export function translateCondition(condition: string, lang: string): string {
  if (lang !== 'pt' || !condition) return condition

  if (BASE_PT[condition]) return BASE_PT[condition]

  // "Break X" / "Wound X"
  const breakMatch = condition.match(/^(Break|Wound)\s+(.+)$/)
  if (breakMatch) {
    const [, prefix, part] = breakMatch
    const prefixPt = prefix === 'Break' ? 'Quebra de' : 'Ferida em'
    const partPt   = PARTS_PT[part] ?? part
    return `${prefixPt} ${partPt}`
  }

  // "Base (Tier)"
  const parenMatch = condition.match(/^(.+?)\s*\((.+)\)$/)
  if (parenMatch) {
    const [, base, tier] = parenMatch
    const basePt = PAREN_BASE_PT[base] ?? BASE_PT[base] ?? base
    const tierPt = TIERS_PT[tier] ?? tier
    return `${basePt} (${tierPt})`
  }

  return condition
}
