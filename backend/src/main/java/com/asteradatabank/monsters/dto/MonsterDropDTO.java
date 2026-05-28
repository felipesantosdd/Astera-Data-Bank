package com.asteradatabank.monsters.dto;

public record MonsterDropDTO(
        Integer itemId,
        String  itemName,
        String  iconName,   // ex: "Bone", "Hide", "Gem" — referencia o SVG base
        String  iconColor,  // ex: "Red", "Gold" — cor de tint aplicada no SVG
        String  rank,       // "LR" | "HR" | "MR"
        String  source,     // categoria derivada para agrupamento: "carve" | "break" | "questReward" | "shiny" | "guidingLands" | "siege" | "palico" | "mining" | "other"
        String  condition,  // texto traduzido da condição (ex: "Corte do Corpo", "Capturar")
        Integer stack,
        Integer percentage
) {}

