package com.asteradatabank.monsters.dto;

import java.util.List;

public record MonsterDetailDTO(

        // ── Identificação ─────────────────────────────────────────────────────
        Integer id,
        String  name,
        String  icon,
        String  ecology,
        String  description,
        String  altStateDescription,

        // ── Fraquezas normais (escala 0–3) ────────────────────────────────────
        Integer weaknessFire,
        Integer weaknessWater,
        Integer weaknessThunder,
        Integer weaknessIce,
        Integer weaknessDragon,
        Integer weaknessPoison,
        Integer weaknessSleep,
        Integer weaknessParalysis,
        Integer weaknessBlast,
        Integer weaknessStun,

        // ── Fraquezas estado alterado (ex: Bazelgeuse enraivecido) ────────────
        Boolean hasAltWeakness,
        Integer altWeaknessFire,
        Integer altWeaknessWater,
        Integer altWeaknessThunder,
        Integer altWeaknessIce,
        Integer altWeaknessDragon,
        Integer altWeaknessPoison,
        Integer altWeaknessSleep,
        Integer altWeaknessParalysis,
        Integer altWeaknessBlast,
        Integer altWeaknessStun,

        // ── Armadilhas ────────────────────────────────────────────────────────
        Boolean pitfallTrap,
        Boolean shockTrap,
        Boolean vineTrap,

        // ── Ailments que o monstro inflige no jogador ─────────────────────────
        String  ailmentRoar,       // "none" | "small" | "large" | "terrible"
        String  ailmentWind,
        String  ailmentTremor,
        Boolean ailmentDefenseDown,
        Boolean ailmentFireblight,
        Boolean ailmentWaterblight,
        Boolean ailmentThunderblight,
        Boolean ailmentIceblight,
        Boolean ailmentDragonblight,
        Boolean ailmentBlastblight,
        Boolean ailmentPoison,
        Boolean ailmentSleep,
        Boolean ailmentParalysis,
        Boolean ailmentBleed,
        Boolean ailmentStun,
        Boolean ailmentMud,
        Boolean ailmentEffluvia,

        // ── Hitzones (partes do corpo) ────────────────────────────────────────
        List<HitzoneDTO> hitzones

) {}
