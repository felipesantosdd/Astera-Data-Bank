/**
 * Strings da interface (labels fixos como "Pitfall", "Cut", "Hitzones").
 * Idiomas não cobertos caem em inglês.
 */
export interface UIStrings {
  nav: { monsters: string; materials: string }
  materials: {
    title: string
    subtitle: string
    recorded: string
    searchPlaceholder: string
    filterType: string
    filterAll: string
    clearFilters: string
    page: string
    noResults: string
    noResultsHint: string
    noSources: string
    // grupos de ícone
    groupMonsterPart: string
    groupMineral: string
    groupPlant: string
    groupOther: string
  }
  listing: {
    bestiary: string
    largeMonsters: string
    monstersRecorded: string
    loadingError: string
    backendHint: string
    searchPlaceholder: string
    filterElement: string
    filterEcology: string
    filterAll: string
    filterNone: string
    clearFilters: string
    noResults: string
    noResultsHint: string
  }
  elements: {
    fire: string
    water: string
    thunder: string
    ice: string
    dragon: string
    blast: string
    poison: string
    sleep: string
    paralysis: string
  }
  conditions: Record<string, string>
  ecologies: {
    'Bird Wyvern': string
    'Brute Wyvern': string
    'Elder Dragon': string
    'Fanged Beast': string
    'Fanged Wyvern': string
    'Flying Wyvern': string
    'Piscine Wyvern': string
    'Relict': string
  }
  detail: {
    back: string
    monsterNotFound: string
    backendHint: string
    bestiary: string
    weaknesses: string
    elemental: string
    status: string
    altState: string
    inflictsOnHunter: string
    trapEffectiveness: string
    hitzones: string
    hitzonesHint: string
    noHitzones: string
  }
  ailments: {
    roar: string
    wind: string
    tremor: string
    fireblight: string
    waterblight: string
    thunderblight: string
    iceblight: string
    dragonblight: string
    blastblight: string
    poison: string
    sleep: string
    paralysis: string
    bleeding: string
    stun: string
    muddy: string
    effluvia: string
    defenseDown: string
  }
  traps: {
    pitfall: string
    shock: string
    vine: string
  }
  columns: {
    part: string
    cut: string
    impact: string
    shot: string
    fire: string
    water: string
    thunder: string
    ice: string
    dragon: string
    ko: string
  }
  armor: {
    section: string
    sectionHint: string
    noArmor: string
    lowRank: string
    highRank: string
    masterRank: string
    rankLR: string
    rankHR: string
    rankMR: string
    setBonus: string
    requiredPieces: string
    defense: string
    defenseBase: string
    defenseMax: string
    defenseAugment: string
    defenseBaseTip: string
    defenseMaxTip: string
    defenseAugmentTip: string
    resistances: string
    slots: string
    skills: string
    materials: string
    rarity: string
  }
  armorTypes: {
    head: string
    chest: string
    arms: string
    waist: string
    legs: string
  }
  itemSources: {
    title: string
    monsterDrops: string
    gathering: string
    noSources: string
    noSourcesHint: string
    noSourcesForRank: string
    close: string
    colMonster: string
    colCondition: string
    colRank: string
    colChance: string
    colStack: string
    colLocation: string
    colArea: string
    colNodes: string
    areaPrefix: string
    questRewards: string
    colQuest: string
    colCategory: string
    colStars: string
    colGroup: string
    rewardGroupA: string
    rewardGroupB: string
    rewardGroupC: string
  }
  tabs: {
    combat: string
    drops: string
    equipment: string
    stats: string
  }
  drops: {
    section: string
    noDrops: string
    statsPlaceholder: string
    searchPlaceholder: string
    searchClear: string
    searchNoResults: string
    searchResultsCount: string
  }
  dropSources: {
    carve: string
    break: string
    questReward: string
    shiny: string
    guidingLands: string
    siege: string
    palico: string
    mining: string
    tracking: string
    other: string
  }
}

const en: UIStrings = {
  nav: { monsters: 'Monsters', materials: 'Materials' },
  materials: {
    title: 'Materials',
    subtitle: 'Materials & Resources',
    recorded: 'materials recorded',
    searchPlaceholder: 'Search materials...',
    filterType: 'Type',
    filterAll: 'All',
    clearFilters: 'Clear filters',
    page: 'page',
    noResults: 'No materials found',
    noResultsHint: 'Try adjusting your search or filters.',
    noSources: 'No sources recorded for this material.',
    groupMonsterPart: 'Monster Parts',
    groupMineral: 'Minerals',
    groupPlant: 'Plants & Bugs',
    groupOther: 'Other',
  },
  listing: {
    bestiary: 'Bestiary',
    largeMonsters: 'Large Monsters',
    monstersRecorded: 'monsters recorded',
    loadingError: 'Failed to load monsters.',
    backendHint: 'Check if the backend is running on localhost:8080.',
    searchPlaceholder: 'Search monsters...',
    filterElement: 'Element',
    filterEcology: 'Type',
    filterAll: 'All',
    filterNone: 'No element',
    clearFilters: 'Clear filters',
    noResults: 'No monsters found',
    noResultsHint: 'Try adjusting your search or filters.',
  },
  elements: {
    fire: 'Fire',
    water: 'Water',
    thunder: 'Thunder',
    ice: 'Ice',
    dragon: 'Dragon',
    blast: 'Blast',
    poison: 'Poison',
    sleep: 'Sleep',
    paralysis: 'Paralysis',
  },
  detail: {
    back: 'Back to Bestiary',
    monsterNotFound: 'Monster not found',
    backendHint: 'Check if the backend is running on localhost:8080.',
    bestiary: 'Bestiary',
    weaknesses: 'Weaknesses',
    elemental: 'Elemental',
    status: 'Status',
    altState: 'Enraged / Alt State',
    inflictsOnHunter: 'Inflicts on Hunter',
    trapEffectiveness: 'Trap Effectiveness',
    hitzones: 'Hitzones',
    hitzonesHint: 'Higher values = more damage. Highlighted cells are the best target per damage type.',
    noHitzones: 'No hitzones recorded for this monster.',
  },
  ailments: {
    roar: 'Roar',
    wind: 'Wind Pressure',
    tremor: 'Tremor',
    fireblight: 'Fireblight',
    waterblight: 'Waterblight',
    thunderblight: 'Thunderblight',
    iceblight: 'Iceblight',
    dragonblight: 'Dragonblight',
    blastblight: 'Blastblight',
    poison: 'Poison',
    sleep: 'Sleep',
    paralysis: 'Paralysis',
    bleeding: 'Bleeding',
    stun: 'Stun',
    muddy: 'Muddy',
    effluvia: 'Effluvia',
    defenseDown: 'Defense Down',
  },
  traps: { pitfall: 'Pitfall', shock: 'Shock', vine: 'Vine' },
  columns: {
    part: 'Part', cut: 'Cut', impact: 'Impact', shot: 'Shot',
    fire: 'Fire', water: 'Water', thunder: 'Thunder', ice: 'Ice',
    dragon: 'Dragon', ko: 'KO',
  },
  armor: {
    section: 'Armor Crafts',
    sectionHint: 'Sets craftable from this monster\'s materials.',
    noArmor: 'No armor sets are crafted from this monster.',
    lowRank: 'Low Rank',
    highRank: 'High Rank',
    masterRank: 'Master Rank',
    rankLR: 'LR',
    rankHR: 'HR',
    rankMR: 'MR',
    setBonus: 'Set Bonus',
    requiredPieces: 'pieces',
    defense: 'Defense',
    defenseBase: 'Base',
    defenseMax: 'Max',
    defenseAugment: 'Augmented',
    defenseBaseTip: 'Defense when the piece is first crafted (level 1).',
    defenseMaxTip: 'Maximum defense after fully upgrading the piece with Armor Spheres.',
    defenseAugmentTip: 'Defense after fully augmenting the piece with Streamstones (Master Rank endgame mechanic).',
    resistances: 'Resistances',
    slots: 'Slots',
    skills: 'Skills',
    materials: 'Materials',
    rarity: 'R',
  },
  armorTypes: {
    head: 'Head',
    chest: 'Chest',
    arms: 'Arms',
    waist: 'Waist',
    legs: 'Legs',
  },
  itemSources: {
    title: 'Where to find',
    monsterDrops: 'Monster Drops',
    gathering: 'Gathering Points',
    noSources: 'No sources recorded for this item.',
    noSourcesHint: 'This item may come from: event quests, limited-time content, crafting, NPC shops, or login bonuses.',
    noSourcesForRank: 'No sources recorded for this rank.',
    close: 'Close',
    colMonster: 'Monster',
    colCondition: 'Condition',
    colRank: 'Rank',
    colChance: 'Chance',
    colStack: 'Stack',
    colLocation: 'Location',
    colArea: 'Area',
    colNodes: 'Nodes',
    areaPrefix: 'Area',
    questRewards: 'Quest Rewards',
    colQuest: 'Quest',
    colCategory: 'Category',
    colStars: 'Stars',
    colGroup: 'Group',
    rewardGroupA: 'Primary',
    rewardGroupB: 'Bonus 1',
    rewardGroupC: 'Bonus 2',
  },
  tabs: {
    combat: 'Combat',
    drops: 'Drops',
    equipment: 'Equipment',
    stats: 'Stats',
  },
  drops: {
    section: 'Drops & Rewards',
    noDrops: 'No drops recorded for this monster.',
    statsPlaceholder: 'Detailed stats coming soon (HP, attack values, etc.).',
    searchPlaceholder: 'Search drops in this rank...',
    searchClear: 'Clear',
    searchNoResults: 'No drops match your search in this rank.',
    searchResultsCount: 'ways to get this drop',
  },
  dropSources: {
    carve: 'Carve',
    break: 'Part Break',
    questReward: 'Quest Reward',
    shiny: 'Shiny Drop',
    guidingLands: 'Guiding Lands',
    siege: 'Siege',
    palico: 'Palico / Tools',
    mining: 'Mining',
    tracking: 'Tracking',
    other: 'Other',
  },
  conditions: {},
  ecologies: {
    'Bird Wyvern':    'Bird Wyvern',
    'Brute Wyvern':   'Brute Wyvern',
    'Elder Dragon':   'Elder Dragon',
    'Fanged Beast':   'Fanged Beast',
    'Fanged Wyvern':  'Fanged Wyvern',
    'Flying Wyvern':  'Flying Wyvern',
    'Piscine Wyvern': 'Piscine Wyvern',
    'Relict':         'Relict',
  },
}

const pt: UIStrings = {
  nav: { monsters: 'Monstros', materials: 'Materiais' },
  materials: {
    title: 'Materiais',
    subtitle: 'Materiais & Recursos',
    recorded: 'materiais catalogados',
    searchPlaceholder: 'Buscar materiais...',
    filterType: 'Tipo',
    filterAll: 'Todos',
    clearFilters: 'Limpar filtros',
    page: 'página',
    noResults: 'Nenhum material encontrado',
    noResultsHint: 'Tente ajustar a busca ou os filtros.',
    noSources: 'Nenhuma fonte registrada para este material.',
    groupMonsterPart: 'Partes de Monstro',
    groupMineral: 'Minerais',
    groupPlant: 'Plantas & Insetos',
    groupOther: 'Outros',
  },
  listing: {
    bestiary: 'Bestiário',
    largeMonsters: 'Grandes Monstros',
    monstersRecorded: 'monstros catalogados',
    loadingError: 'Falha ao carregar monstros.',
    backendHint: 'Verifique se o backend está rodando em localhost:8080.',
    searchPlaceholder: 'Buscar monstros...',
    filterElement: 'Elemento',
    filterEcology: 'Tipo',
    filterAll: 'Todos',
    filterNone: 'Sem elemento',
    clearFilters: 'Limpar filtros',
    noResults: 'Nenhum monstro encontrado',
    noResultsHint: 'Tente ajustar a busca ou os filtros.',
  },
  elements: {
    fire: 'Fogo',
    water: 'Água',
    thunder: 'Trovão',
    ice: 'Gelo',
    dragon: 'Dragão',
    blast: 'Explosão',
    poison: 'Veneno',
    sleep: 'Sono',
    paralysis: 'Paralisia',
  },
  detail: {
    back: 'Voltar ao Bestiário',
    monsterNotFound: 'Monstro não encontrado',
    backendHint: 'Verifique se o backend está rodando em localhost:8080.',
    bestiary: 'Bestiário',
    weaknesses: 'Fraquezas',
    elemental: 'Elemental',
    status: 'Status',
    altState: 'Enfurecido / Estado Alterado',
    inflictsOnHunter: 'Inflige no Caçador',
    trapEffectiveness: 'Efetividade de Armadilhas',
    hitzones: 'Zonas de Acerto',
    hitzonesHint: 'Valores maiores = mais dano. Células destacadas são os melhores alvos para cada tipo de dano.',
    noHitzones: 'Sem zonas de acerto registradas para este monstro.',
  },
  ailments: {
    roar: 'Rugido',
    wind: 'Pressão do Vento',
    tremor: 'Tremor',
    fireblight: 'Mal-do-Fogo',
    waterblight: 'Mal-da-Água',
    thunderblight: 'Mal-do-Trovão',
    iceblight: 'Mal-do-Gelo',
    dragonblight: 'Mal-do-Dragão',
    blastblight: 'Mal-Explosivo',
    poison: 'Veneno',
    sleep: 'Sono',
    paralysis: 'Paralisia',
    bleeding: 'Sangramento',
    stun: 'Atordoamento',
    muddy: 'Lamacento',
    effluvia: 'Efluvio',
    defenseDown: 'Defesa Reduzida',
  },
  traps: { pitfall: 'Cova', shock: 'Choque', vine: 'Liana' },
  columns: {
    part: 'Parte', cut: 'Corte', impact: 'Impacto', shot: 'Tiro',
    fire: 'Fogo', water: 'Água', thunder: 'Trovão', ice: 'Gelo',
    dragon: 'Dragão', ko: 'Atordoar',
  },
  armor: {
    section: 'Armaduras Craftáveis',
    sectionHint: 'Sets feitos a partir dos materiais deste monstro.',
    noArmor: 'Nenhum set de armadura é craftado a partir deste monstro.',
    lowRank: 'Rank Baixo',
    highRank: 'Rank Alto',
    masterRank: 'Rank Mestre',
    rankLR: 'LR',
    rankHR: 'HR',
    rankMR: 'MR',
    setBonus: 'Bônus de Set',
    requiredPieces: 'peças',
    defense: 'Defesa',
    defenseBase: 'Base',
    defenseMax: 'Máx',
    defenseAugment: 'Aumentada',
    defenseBaseTip: 'Defesa quando a peça é craftada inicialmente (nível 1).',
    defenseMaxTip: 'Defesa máxima após upar totalmente a peça com Armor Spheres.',
    defenseAugmentTip: 'Defesa após augment completo com Streamstones (mecânica de endgame de Master Rank).',
    resistances: 'Resistências',
    slots: 'Slots',
    skills: 'Habilidades',
    materials: 'Materiais',
    rarity: 'R',
  },
  armorTypes: {
    head: 'Cabeça',
    chest: 'Peito',
    arms: 'Braços',
    waist: 'Cintura',
    legs: 'Pernas',
  },
  itemSources: {
    title: 'Onde encontrar',
    monsterDrops: 'Drops de Monstros',
    gathering: 'Pontos de Coleta',
    noSources: 'Nenhuma fonte registrada para este item.',
    noSourcesHint: 'Este item pode vir de: missões de evento, conteúdo por tempo limitado, craft, lojas de NPCs ou bônus de login.',
    noSourcesForRank: 'Nenhuma fonte registrada para este rank.',
    close: 'Fechar',
    colMonster: 'Monstro',
    colCondition: 'Condição',
    colRank: 'Rank',
    colChance: 'Chance',
    colStack: 'Stack',
    colLocation: 'Local',
    colArea: 'Área',
    colNodes: 'Nodes',
    areaPrefix: 'Área',
    questRewards: 'Recompensas de Missão',
    colQuest: 'Missão',
    colCategory: 'Categoria',
    colStars: 'Estrelas',
    colGroup: 'Grupo',
    rewardGroupA: 'Primária',
    rewardGroupB: 'Bônus 1',
    rewardGroupC: 'Bônus 2',
  },
  tabs: {
    combat: 'Combate',
    drops: 'Drops',
    equipment: 'Equipamentos',
    stats: 'Stats',
  },
  drops: {
    section: 'Drops & Recompensas',
    noDrops: 'Nenhum drop registrado para este monstro.',
    statsPlaceholder: 'Stats detalhadas em breve (HP, valores de ataque, etc.).',
    searchPlaceholder: 'Buscar drops neste rank...',
    searchClear: 'Limpar',
    searchNoResults: 'Nenhum drop corresponde à busca neste rank.',
    searchResultsCount: 'formas de obter esse drop',
  },
  dropSources: {
    carve: 'Corte',
    break: 'Quebra de Parte',
    questReward: 'Recompensa de Missão',
    shiny: 'Drop Cintilante',
    guidingLands: 'Guiding Lands',
    siege: 'Cerco',
    palico: 'Palico / Ferramentas',
    mining: 'Mineração',
    tracking: 'Rastreamento',
    other: 'Outros',
  },
  conditions: {
    'Appraisal (Blue)':              'Avaliação (Azul)',
    'Appraisal (Bronze)':            'Avaliação (Bronze)',
    'Appraisal (Gold)':              'Avaliação (Ouro)',
    'Appraisal (Silver)':            'Avaliação (Prata)',
    'Back Mining':                   'Mineração nas Costas',
    'Bandit Mantle':                 'Manto Bandido',
    'Body Carve':                    'Cortar Corpo',
    'Break Horn':                    'Quebrar Chifre',
    'Break Horns':                   'Quebrar Chifres',
    'Break Left Leg Mantle':         'Quebrar Manto Pata Esq.',
    'Break Left Wing Mantle':        'Quebrar Manto Asa Esq.',
    'Break Right Leg Mantle':        'Quebrar Manto Pata Dir.',
    'Break Right Wing Mantle':       'Quebrar Manto Asa Dir.',
    'Carve / Capture':               'Cortar / Capturar',
    'Gold Plating Carved':           'Revestimento Dourado Cortado',
    'Guiding Lands (High)':          'Guiding Lands (Alto)',
    'Guiding Lands (Low)':           'Guiding Lands (Baixo)',
    'Guiding Lands (Mid)':           'Guiding Lands (Médio)',
    'Guiding Lands (Tempered)':      'Guiding Lands (Temperado)',
    'Head Shell Carve':              'Cortar Carapaça da Cabeça',
    'Horn Carve':                    'Cortar Chifre',
    'Hunt (Bronze)':                 'Caçada (Bronze)',
    'Investigation (Gold)':          'Investigação (Ouro)',
    'Investigation (Purple)':        'Investigação (Roxo)',
    'Investigation (Silver)':        'Investigação (Prata)',
    'Palico Bonus':                  'Bônus Palico',
    'Plunderblade':                  'Lâmina Saqueadora',
    'Red Crystal Mining / Shiny':    'Mineração Cristal Vermelho / Cintilante',
    'Shiny Drop':                    'Drop Cintilante',
    'Siege Progress':                'Progresso do Cerco',
    'Siege Reward (Fury)':           'Recompensa do Cerco (Fúria)',
    'Tail Carve':                    'Cortar Cauda',
    'Track':                         'Rastrear',
    'Wound 1 Horn':                  'Ferir 1 Chifre',
    'Wound Antennae':                'Ferir Antenas',
    'Wound Back':                    'Ferir Costas',
    'Wound Beak':                    'Ferir Bico',
    'Wound Belly':                   'Ferir Barriga',
    'Wound Body':                    'Ferir Corpo',
    'Wound Chest':                   'Ferir Peito',
    'Wound Chest Shell':             'Ferir Carapaça do Peito',
    'Wound Claws':                   'Ferir Garras',
    'Wound Fin':                     'Ferir Nadadeira',
    'Wound Forearms':                'Ferir Antebraços',
    'Wound Forelegs':                'Ferir Patas Dianteiras',
    'Wound Head':                    'Ferir Cabeça',
    'Wound Hindlegs':                'Ferir Patas Traseiras',
    'Wound Horn':                    'Ferir Chifre',
    'Wound Horns':                   'Ferir Chifres',
    'Wound Jaw':                     'Ferir Mandíbula',
    'Wound Left Foreleg':            'Ferir Pata Dianteira Esq.',
    'Wound Left Hindleg':            'Ferir Pata Traseira Esq.',
    'Wound Left Wing':               'Ferir Asa Esquerda',
    'Wound Legs':                    'Ferir Patas',
    'Wound Neck Pouch':              'Ferir Bolsa do Pescoço',
    'Wound Right Foreleg':           'Ferir Pata Dianteira Dir.',
    'Wound Right Hindleg':           'Ferir Pata Traseira Dir.',
    'Wound Right Wing':              'Ferir Asa Direita',
    'Wound Tail':                    'Ferir Cauda',
    'Wound Wings':                   'Ferir Asas',
  },
  ecologies: {
    'Bird Wyvern':    'Serpe Pássaro',
    'Brute Wyvern':   'Serpe Bruta',
    'Elder Dragon':   'Dragão Ancião',
    'Fanged Beast':   'Besta de Presas',
    'Fanged Wyvern':  'Serpe de Presas',
    'Flying Wyvern':  'Serpe Alada',
    'Piscine Wyvern': 'Hidroserpe',
    'Relict':         'Lendário',
  },
}

const STRINGS: Record<string, UIStrings> = { en, pt }

export function getUIStrings(lang: string): UIStrings {
  return STRINGS[lang] ?? en
}
