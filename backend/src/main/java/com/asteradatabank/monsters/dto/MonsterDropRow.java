package com.asteradatabank.monsters.dto;

/**
 * Linha bruta do banco — Service deriva o `source` a partir do
 * `conditionEn` (nome em inglês, estável) e monta o MonsterDropDTO final.
 */
public record MonsterDropRow(
        Integer itemId,
        String  itemName,
        String  iconName,
        String  iconColor,
        String  rank,
        String  conditionEn,
        String  condition,
        Integer stack,
        Integer percentage
) {}
