package com.asteradatabank.armor.dto;

/** Resultado bruto da query de peças — usado internamente pelo Service. */
public record ArmorPieceRow(
        Integer id,
        String  name,
        String  type,
        Integer rarity,

        Integer defenseBase,
        Integer defenseMax,
        Integer defenseAugmentMax,

        Integer fire,
        Integer water,
        Integer thunder,
        Integer ice,
        Integer dragon,

        Integer slot1,
        Integer slot2,
        Integer slot3,

        Integer armorsetId,
        Integer recipeId
) {}
