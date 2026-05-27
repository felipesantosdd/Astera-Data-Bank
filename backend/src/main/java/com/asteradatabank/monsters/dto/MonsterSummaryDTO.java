package com.asteradatabank.monsters.dto;

/**
 * DTO retornado pelo endpoint GET /api/monsters.
 *
 * É um Java Record: imutável, sem boilerplate, perfeito para dados de resposta.
 * O construtor aqui DEVE bater com o SELECT do JPQL no MonsterRepository.
 */
public record MonsterSummaryDTO(
        Integer id,
        String  name,
        String  icon,

        // Fraquezas elementais (escala 0–5)
        Integer weaknessFire,
        Integer weaknessWater,
        Integer weaknessThunder,
        Integer weaknessIce,
        Integer weaknessDragon,

        // Fraquezas de status
        Integer weaknessPoison,
        Integer weaknessSleep,
        Integer weaknessParalysis,
        Integer weaknessBlast,
        Integer weaknessStun,

        // Armadilhas
        Boolean pitfallTrap,
        Boolean shockTrap,
        Boolean vineTrap
) {}
