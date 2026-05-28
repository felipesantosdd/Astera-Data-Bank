package com.asteradatabank.items.dto;

/**
 * DTO retornado pelo endpoint GET /api/items.
 * Representa um item/material na listagem geral.
 */
public record ItemSummaryDTO(
        Integer id,
        String  name,
        Integer rarity,
        String  iconName,
        String  iconColor,
        String  category,
        String  subcategory
) {}
