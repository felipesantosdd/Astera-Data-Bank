import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'

interface ArmorSkillLevel {
  level: number
  description: string | null
}

interface ArmorSkill {
  name: string
  levels?: ArmorSkillLevel[]
}

interface ArmorPiece {
  skills?: ArmorSkill[]
}

interface ArmorSet {
  pieces?: ArmorPiece[]
}

async function fetchArmor(lang: string): Promise<ArmorSet[]> {
  const res = await fetch(dataUrl.armor(lang))
  if (!res.ok) throw new Error(`Erro ao buscar armaduras: ${res.status}`)
  return res.json()
}

export function useSkillsIndex() {
  const { lang } = storeToRefs(useLanguageStore())

  const { data: armorData } = useQuery({
    queryKey: computed(() => ['armor', lang.value]),
    queryFn: () => fetchArmor(lang.value),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  })

  const skillLevels = computed(() => {
    const map = new Map<string, ArmorSkillLevel[]>()
    for (const set of armorData.value ?? []) {
      for (const piece of set.pieces ?? []) {
        for (const skill of piece.skills ?? []) {
          if (skill.name && skill.levels?.length && !map.has(skill.name)) {
            map.set(skill.name, skill.levels)
          }
        }
      }
    }
    return map
  })

  function getLevels(skillName: string | null | undefined): ArmorSkillLevel[] {
    if (!skillName) return []
    return skillLevels.value.get(skillName) ?? []
  }

  return { getLevels }
}
