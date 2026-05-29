package com.asteradatabank.armor;

import com.asteradatabank.LangUtil;
import com.asteradatabank.armor.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArmorService {

    private final ArmorRepository armorRepository;

    public List<ArmorSetDTO> getAllArmor(String lang) {
        String language = LangUtil.normalize(lang);
        List<ArmorSetRow> sets = armorRepository.findAllSets(language);
        return buildArmorSetDTOs(sets, language);
    }

    public List<ArmorSetDTO> getArmorByMonsterId(Integer monsterId, String lang) {
        String language = LangUtil.normalize(lang);
        List<ArmorSetRow> sets = armorRepository.findSetsByMonsterId(monsterId, language);
        return buildArmorSetDTOs(sets, language);
    }

    // ── Lógica de montagem compartilhada ─────────────────────────────────────

    private List<ArmorSetDTO> buildArmorSetDTOs(List<ArmorSetRow> sets, String language) {
        if (sets.isEmpty()) return List.of();

        List<Integer> setIds   = sets.stream().map(ArmorSetRow::id).toList();
        List<Integer> bonusIds = sets.stream()
                .map(ArmorSetRow::armorsetBonusId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<ArmorPieceRow> pieces = armorRepository.findPiecesBySetIds(setIds, language);

        List<Integer> armorIds  = pieces.stream().map(ArmorPieceRow::id).toList();
        List<Integer> recipeIds = pieces.stream()
                .map(ArmorPieceRow::recipeId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<ArmorSkillRow> skillRows = armorIds.isEmpty() ? List.of()
                : armorRepository.findSkillsByArmorIds(armorIds, language);
        List<ArmorSetBonusSkillRow> bonusSkillRows = bonusIds.isEmpty() ? List.of()
                : armorRepository.findBonusSkillsByIds(bonusIds, language);

        List<Integer> skilltreeIds = Stream.concat(
                skillRows.stream().map(ArmorSkillRow::skilltreeId),
                bonusSkillRows.stream().map(ArmorSetBonusSkillRow::skilltreeId)
        ).distinct().toList();

        Map<Integer, List<SkillLevelDTO>> levelsBySkilltree = skilltreeIds.isEmpty() ? Map.of()
                : armorRepository.findLevelsBySkilltreeIds(skilltreeIds, language).stream()
                        .collect(Collectors.groupingBy(
                                SkillLevelRow::skilltreeId,
                                Collectors.mapping(
                                        r -> new SkillLevelDTO(r.level(), r.description()),
                                        Collectors.toList())));

        Map<Integer, List<ArmorSkillDTO>> skillsByArmor = skillRows.stream()
                .collect(Collectors.groupingBy(
                        ArmorSkillRow::armorId,
                        Collectors.mapping(
                                r -> new ArmorSkillDTO(
                                        r.name(), r.description(), r.level(),
                                        levelsBySkilltree.getOrDefault(r.skilltreeId(), List.of())),
                                Collectors.toList())));

        Map<Integer, List<ArmorMaterialDTO>> materialsByRecipe = recipeIds.isEmpty() ? Map.of()
                : armorRepository.findMaterialsByRecipeIds(recipeIds, language).stream()
                        .collect(Collectors.groupingBy(
                                ArmorMaterialRow::recipeId,
                                Collectors.mapping(
                                        r -> new ArmorMaterialDTO(r.itemId(), r.name(), r.quantity()),
                                        Collectors.toList())));

        Map<Integer, ArmorSetBonusRow> bonusById = bonusIds.isEmpty() ? Map.of()
                : armorRepository.findBonusesByIds(bonusIds, language).stream()
                        .collect(Collectors.toMap(ArmorSetBonusRow::bonusId, b -> b));

        Map<Integer, List<ArmorSetBonusSkillDTO>> bonusSkillsById = bonusSkillRows.stream()
                .collect(Collectors.groupingBy(
                        ArmorSetBonusSkillRow::bonusId,
                        Collectors.mapping(
                                r -> new ArmorSetBonusSkillDTO(
                                        r.name(), r.description(), r.required(),
                                        levelsBySkilltree.getOrDefault(r.skilltreeId(), List.of())),
                                Collectors.toList())));

        Map<Integer, List<ArmorPieceDTO>> piecesBySet = pieces.stream()
                .collect(Collectors.groupingBy(
                        ArmorPieceRow::armorsetId,
                        Collectors.mapping(p -> new ArmorPieceDTO(
                                p.id(), p.name(), p.type(), p.rarity(),
                                p.defenseBase(), p.defenseMax(), p.defenseAugmentMax(),
                                p.fire(), p.water(), p.thunder(), p.ice(), p.dragon(),
                                p.slot1(), p.slot2(), p.slot3(),
                                skillsByArmor.getOrDefault(p.id(), List.of()),
                                p.recipeId() != null
                                        ? materialsByRecipe.getOrDefault(p.recipeId(), List.of())
                                        : List.of()),
                                Collectors.toList())));

        return sets.stream().map(s -> {
            ArmorSetBonusDTO bonus = null;
            if (s.armorsetBonusId() != null && bonusById.containsKey(s.armorsetBonusId())) {
                ArmorSetBonusRow br = bonusById.get(s.armorsetBonusId());
                bonus = new ArmorSetBonusDTO(
                        br.name(), br.description(),
                        bonusSkillsById.getOrDefault(s.armorsetBonusId(), List.of()));
            }
            return new ArmorSetDTO(
                    s.id(), s.name(), s.rank(), bonus,
                    piecesBySet.getOrDefault(s.id(), List.of()));
        }).toList();
    }
}
