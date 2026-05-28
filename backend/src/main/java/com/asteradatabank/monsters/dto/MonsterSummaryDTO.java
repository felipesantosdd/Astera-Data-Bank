package com.asteradatabank.monsters.dto;

import java.util.List;

/**
 * DTO retornado pelo endpoint GET /api/monsters.
 *
 * É um Java Record: imutável, sem boilerplate, perfeito para dados de resposta.
 * Os campos ecology e elements são derivados no MonsterService a partir das
 * entidades Monster + MonsterText — não vêm de constructor JPQL direto.
 */
public record MonsterSummaryDTO(
        Integer id,
        String  name,
        String  icon,

        // Ecologia/tipo (localizado — ex: "Flying Wyvern", "Serpe Voadora")
        String  ecology,

        // Elementos que o monstro usa (derivados dos ailments de blight que inflige)
        // Vazio = físico / sem elemento ofensivo
        List<String> elements,

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
