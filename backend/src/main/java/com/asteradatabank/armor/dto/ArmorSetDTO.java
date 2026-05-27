package com.asteradatabank.armor.dto;

import java.util.List;

public record ArmorSetDTO(
        Integer id,
        String  name,
        String  rank,             // "LR" | "HR" | "MR"
        ArmorSetBonusDTO bonus,   // pode ser null
        List<ArmorPieceDTO> pieces
) {}
