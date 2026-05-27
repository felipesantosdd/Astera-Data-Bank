package com.asteradatabank.armor.dto;

import java.util.List;

public record ArmorPieceDTO(
        Integer id,
        String  name,
        String  type,           // "head" | "chest" | "arms" | "waist" | "legs"
        Integer rarity,

        // Defesa
        Integer defenseBase,
        Integer defenseMax,
        Integer defenseAugmentMax,

        // Resistências elementais
        Integer fire,
        Integer water,
        Integer thunder,
        Integer ice,
        Integer dragon,

        // Slots de decoração (nível 0–4, 0 = sem slot)
        Integer slot1,
        Integer slot2,
        Integer slot3,

        List<ArmorSkillDTO>    skills,
        List<ArmorMaterialDTO> materials
) {}
