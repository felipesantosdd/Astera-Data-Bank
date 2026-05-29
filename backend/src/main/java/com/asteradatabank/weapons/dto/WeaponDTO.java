package com.asteradatabank.weapons.dto;

import java.util.List;

public record WeaponDTO(
        Integer id,
        String  name,
        String  weaponType,
        Integer rarity,
        String  category,
        Integer previousWeaponId,

        Integer attack,
        Integer affinity,
        Integer defense,
        String  elderseal,

        Integer slot1,
        Integer slot2,
        Integer slot3,

        String  element1,
        Integer element1Attack,
        String  element2,
        Integer element2Attack,
        Boolean elementHidden,

        Boolean craftable,
        Boolean isFinal,

        String  phial,
        Integer phialPower,
        String  shelling,
        Integer shellingLevel,
        String  kinsectBonus,
        String  notes,

        List<WeaponCraftItemDTO> craftMaterials,   // receita de criação (craftable)
        List<WeaponCraftItemDTO> upgradeMaterials  // receita de melhoria (upgrade)
) {}
