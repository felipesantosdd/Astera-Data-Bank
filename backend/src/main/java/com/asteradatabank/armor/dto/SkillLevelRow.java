package com.asteradatabank.armor.dto;

/** Resultado bruto da query de descrições por nível — agrupada por skilltreeId no service. */
public record SkillLevelRow(
        Integer skilltreeId,
        Integer level,
        String  description
) {}
