package com.asteradatabank.armor.dto;

import java.util.List;

public record ArmorSetBonusDTO(
        String name,
        String description,
        List<ArmorSetBonusSkillDTO> skills
) {}
