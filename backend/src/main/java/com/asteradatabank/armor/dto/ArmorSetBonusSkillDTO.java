package com.asteradatabank.armor.dto;

import java.util.List;

public record ArmorSetBonusSkillDTO(
        String  name,
        String  description,
        Integer required,
        List<SkillLevelDTO> levels
) {}
