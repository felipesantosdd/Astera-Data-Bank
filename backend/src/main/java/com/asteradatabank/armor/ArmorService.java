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

    /**
     * Devolve todos os sets de armadura craftáveis a partir do monstro,
     * com peças, skills, materiais, bônus de set e níveis das skills.
     *
     * Estratégia: queries flat → agrupamento por ID em memória → montagem
     * do grafo aninhado. Evita N+1 sem precisar de JOIN FETCH gigante.
     */
    public List<ArmorSetDTO> getArmorByMonsterId(Integer monsterId, String lang) {
        String language = LangUtil.normalize(lang);

        // 1. Sets do monstro
        List<ArmorSetRow> sets = armorRepository.findSetsByMonsterId(monsterId, language);
        if (sets.isEmpty()) return List.of();

        List<Integer> setIds   = sets.stream().map(ArmorSetRow::id).toList();
        List<Integer> bonusIds = sets.stream()
                .map(ArmorSetRow::armorsetBonusId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        // 2. Peças
        List<ArmorPieceRow> pieces = armorRepository.findPiecesBySetIds(setIds, language);

        List<Integer> armorIds  = pieces.stream().map(ArmorPieceRow::id).toList();
        List<Integer> recipeIds = pieces.stream()
                .map(ArmorPieceRow::recipeId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        // 3. Skills das peças e bônus (mantemos os rows pra ter acesso ao skilltreeId)
        List<ArmorSkillRow> skillRows = armorIds.isEmpty() ? List.of()
                : armorRepository.findSkillsByArmorIds(armorIds, language);
        List<ArmorSetBonusSkillRow> bonusSkillRows = bonusIds.isEmpty() ? List.of()
                : armorRepository.findBonusSkillsByIds(bonusIds, language);

        // 4. Coleta todos os skilltree_ids únicos das duas listas, busca os níveis
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

        // 5. Agrupa skills das peças por armorId, já anexando os níveis
        Map<Integer, List<ArmorSkillDTO>> skillsByArmor = skillRows.stream()
                .collect(Collectors.groupingBy(
                        ArmorSkillRow::armorId,
                        Collectors.mapping(
                                r -> new ArmorSkillDTO(
                                        r.name(),
                                        r.description(),
                                        r.level(),
                                        levelsBySkilltree.getOrDefault(r.skilltreeId(), List.of())
                                ),
                                Collectors.toList())));

        // 6. Materiais por receita
        Map<Integer, List<ArmorMaterialDTO>> materialsByRecipe = recipeIds.isEmpty() ? Map.of()
                : armorRepository.findMaterialsByRecipeIds(recipeIds, language).stream()
                .collect(Collectors.groupingBy(
                        ArmorMaterialRow::recipeId,
                        Collectors.mapping(
                                r -> new ArmorMaterialDTO(r.itemId(), r.name(), r.quantity()),
                                Collectors.toList())));

        // 7. Bônus por id
        Map<Integer, ArmorSetBonusRow> bonusById = bonusIds.isEmpty() ? Map.of()
                : armorRepository.findBonusesByIds(bonusIds, language).stream()
                .collect(Collectors.toMap(ArmorSetBonusRow::bonusId, b -> b));

        // 8. Skills dos bônus agrupadas por bonusId (com níveis)
        Map<Integer, List<ArmorSetBonusSkillDTO>> bonusSkillsById = bonusSkillRows.stream()
                .collect(Collectors.groupingBy(
                        ArmorSetBonusSkillRow::bonusId,
                        Collectors.mapping(
                                r -> new ArmorSetBonusSkillDTO(
                                        r.name(),
                                        r.description(),
                                        r.required(),
                                        levelsBySkilltree.getOrDefault(r.skilltreeId(), List.of())
                                ),
                                Collectors.toList())));

        // 9. Monta peças (com skills e materiais), agrupadas por set
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
                                        : List.of()
                        ), Collectors.toList())));

        // 10. Monta sets finais
        return sets.stream().map(s -> {
            ArmorSetBonusDTO bonus = null;
            if (s.armorsetBonusId() != null && bonusById.containsKey(s.armorsetBonusId())) {
                ArmorSetBonusRow br = bonusById.get(s.armorsetBonusId());
                bonus = new ArmorSetBonusDTO(
                        br.name(),
                        br.description(),
                        bonusSkillsById.getOrDefault(s.armorsetBonusId(), List.of())
                );
            }
            return new ArmorSetDTO(
                    s.id(), s.name(), s.rank(), bonus,
                    piecesBySet.getOrDefault(s.id(), List.of())
            );
        }).toList();
    }
}
