package com.asteradatabank.armor.dto;

/** Resultado bruto da query de armorsets — usado internamente pelo Service. */
public record ArmorSetRow(
        Integer id,
        String  name,
        String  rank,
        Integer armorsetBonusId
) {}
