package com.asteradatabank.armor.dto;

/** Resultado bruto da query de skills do bônus de set — agrupado por bonusId. */
public record ArmorSetBonusSkillRow(
        Integer bonusId,
        Integer skilltreeId,
        String  name,
        String  description,
        Integer required
) {}
