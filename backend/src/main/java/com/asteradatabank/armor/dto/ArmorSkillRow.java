package com.asteradatabank.armor.dto;

/** Resultado bruto da query de skills das peças — agrupado por armorId no Service. */
public record ArmorSkillRow(
        Integer armorId,
        Integer skilltreeId,
        String  name,
        String  description,
        Integer level
) {}
