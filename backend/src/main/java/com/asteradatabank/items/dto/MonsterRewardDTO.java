package com.asteradatabank.items.dto;

public record MonsterRewardDTO(
        Integer monsterId,
        String  monsterName,
        String  rank,
        String  condition,
        Integer stack,
        Integer percentage
) {}
