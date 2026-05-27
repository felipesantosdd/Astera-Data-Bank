package com.asteradatabank.armor.dto;

/** Resultado bruto da query de materiais — agrupado por recipeId no Service. */
public record ArmorMaterialRow(
        Integer recipeId,
        Integer itemId,
        String  name,
        Integer quantity
) {}
