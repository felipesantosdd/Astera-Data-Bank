package com.asteradatabank.armor.dto;

/** Resultado bruto da query de bônus de set. */
public record ArmorSetBonusRow(
        Integer bonusId,
        String  name,
        String  description
) {}
