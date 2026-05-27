/**
 * Tradução das partes do corpo (hitzones) — o MHWorldData mantém esses
 * nomes em inglês mesmo nos outros idiomas, então fazemos a tradução aqui.
 *
 * Os nomes vêm em formato "Base" ou "Base (Estado)" — ex: "Head", "Tail (Wounded)".
 * O algoritmo separa as duas partes e traduz cada uma.
 */

const PARTS_PT: Record<string, string> = {
  // Cabeça e adjacências
  'Head':         'Cabeça',
  'Head Bone':    'Osso da Cabeça',
  'Head Casing (Top)':    'Casca da Cabeça (Topo)',
  'Head Casing (Bottom)': 'Casca da Cabeça (Base)',
  'Head / Body':  'Cabeça / Corpo',
  'Neck':         'Pescoço',
  'Upper Neck':   'Pescoço Superior',
  'Lower Neck':   'Pescoço Inferior',
  'Neck Pouch':   'Bolsa do Pescoço',
  'Neck/Back':    'Pescoço/Costas',
  'Throat':       'Garganta',
  'Jaw':          'Mandíbula',
  'Nose':         'Nariz',
  'Snout':        'Focinho',
  'Mane':         'Juba',
  'Ears':         'Orelhas',
  'Antennae':     'Antenas',
  'Horn':         'Chifre',
  'Horns':        'Chifres',

  // Corpo
  'Body':         'Corpo',
  'Body/Back':    'Corpo/Costas',
  'Torso':        'Tronco',
  'Chest':        'Peito',
  'Back':        'Costas',
  'Back Bone':    'Espinha',
  'Belly':        'Barriga',
  'Stomach':      'Estômago',
  'Behind':       'Traseiro',
  'Lower Body':   'Parte Inferior',
  'Shell':        'Carapaça',
  'Rock':         'Rocha',
  'Webbing':      'Membrana',
  'Fin':          'Nadadeira',
  'Fins':         'Nadadeiras',

  // Patas e pernas
  'Arms':                 'Braços',
  'Forearms':             'Antebraços',
  'Forelegs':             'Patas Dianteiras',
  'Front Legs':           'Patas Dianteiras',
  'Forelimbs':            'Membros Dianteiros',
  'Forefeet':             'Pés Dianteiros',
  'Hindlegs':             'Patas Traseiras',
  'Hind Legs':            'Patas Traseiras',
  'Hindfeet':             'Pés Traseiros',
  'Legs':                 'Pernas',
  'Foreleg+Feet':         'Pata Dianteira + Pé',
  'Hindleg+Feet':         'Pata Traseira + Pé',
  'Left Foreleg':         'Pata Dianteira Esquerda',
  'Right Foreleg':        'Pata Dianteira Direita',
  'Left Hindleg':         'Pata Traseira Esquerda',
  'Right Hindleg':        'Pata Traseira Direita',
  'Left Hindleg Bone':    'Osso da Pata Traseira Esquerda',
  'Right Hindleg Bone':   'Osso da Pata Traseira Direita',
  'Left Leg':             'Perna Esquerda',
  'Right Leg':            'Perna Direita',
  'Claws':                'Garras',

  // Asas
  'Wings':        'Asas',
  'Wing Tips':    'Pontas das Asas',
  'Left Wing':    'Asa Esquerda',
  'Right Wing':   'Asa Direita',

  // Cauda
  'Tail':         'Cauda',
  'Tail Base':    'Base da Cauda',
  'Tail Tip':     'Ponta da Cauda',
  'Upper Tail':   'Cauda Superior',

  // Casos compostos
  'Body / Forelimb / Tail': 'Corpo / Membro Dianteiro / Cauda',
  'Left Weak Shell':        'Carapaça Fraca Esquerda',
  'Right Weak Shell':       'Carapaça Fraca Direita',
  'Exhaust Organ (Central)': 'Órgão de Exaustão (Central)',
  'Exhaust Organ (Crater)':  'Órgão de Exaustão (Cratera)',
  'Exhaust Organ (Head)':    'Órgão de Exaustão (Cabeça)',
  'Exhaust Organ (Rear)':    'Órgão de Exaustão (Traseiro)',
}

const STATES_PT: Record<string, string> = {
  'Broken':            'Quebrada',
  'Wounded':           'Ferida',
  'Charged':           'Carregada',
  'Enraged':           'Enfurecida',
  'Critical State':    'Estado Crítico',
  'SCritical':         'Super Crítico',
  'Broken+SCritical':  'Quebrada + Super Crítica',
  'Dragon':            'Dragão',
  'Fire':              'Fogo',
  'Ice':               'Gelo',
  'Molten':            'Derretida',
  'Inflated':          'Inflada',
  'Dehydrated':        'Desidratada',
  'Mud':               'Lama',
  'Snow':              'Neve',
  'Released':          'Liberada',
  'Black':             'Preta',
  'White':             'Branca',
  'Red':               'Vermelha',
  'Red Slime':         'Lodo Vermelho',
  'Gloss Black':       'Preto Brilhante',
  'Heated':            'Aquecida',
  'Sharpened':         'Afiada',
  'Crystal':           'Cristal',
  'Spore Sac':         'Saco de Esporos',
  'Exposed':           'Exposta',
  'Electricity':       'Eletricidade',
  'Rampage':           'Fúria',
  'Rusted':            'Enferrujada',
  'After Wounded':     'Após Ferida',
  'Before Wounded':    'Antes de Ferir',
  'Rock 1':            'Rocha 1',
  'Rock 2':            'Rocha 2',
}

/**
 * Traduz uma parte do corpo para o idioma. Se não houver tradução, devolve o original.
 * Reconhece o padrão "Base (Estado)" e traduz cada lado separadamente.
 */
export function translatePart(name: string, lang: string): string {
  if (lang !== 'pt') return name

  // Tradução exata primeiro (casos compostos)
  if (PARTS_PT[name]) return PARTS_PT[name]

  // Padrão "Base (Estado)"
  const match = name.match(/^(.+?)\s*\((.+)\)$/)
  if (match) {
    const [, base, state] = match
    const basePt  = PARTS_PT[base]   ?? base
    const statePt = STATES_PT[state] ?? state
    return `${basePt} (${statePt})`
  }

  return name
}
