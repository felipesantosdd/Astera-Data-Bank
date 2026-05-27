package com.asteradatabank.armor.dto;

import java.util.List;

public record ArmorSkillDTO(
        String  name,
        String  description,
        Integer level,
        List<SkillLevelDTO> levels
) {}
