package com.asteradatabank.weapons.dto;

public record WeaponMaterialRow(
        Integer recipeId,
        Integer itemId,
        String  name,
        Integer quantity
) {}
