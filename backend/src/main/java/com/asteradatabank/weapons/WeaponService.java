package com.asteradatabank.weapons;

import com.asteradatabank.LangUtil;
import com.asteradatabank.weapons.dto.WeaponCraftItemDTO;
import com.asteradatabank.weapons.dto.WeaponDTO;
import com.asteradatabank.weapons.dto.WeaponMaterialRow;
import com.asteradatabank.weapons.dto.WeaponRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WeaponService {

    private final WeaponRepository weaponRepository;

    public List<WeaponDTO> getAllWeapons(String lang) {
        String language = LangUtil.normalize(lang);

        List<WeaponRow> rows = weaponRepository.findAllWithName(language);
        if (rows.isEmpty()) return List.of();

        // Coleta todos os recipe IDs únicos (tanto create quanto upgrade)
        List<Integer> allRecipeIds = Stream.concat(
                rows.stream().map(WeaponRow::createRecipeId),
                rows.stream().map(WeaponRow::upgradeRecipeId)
        )
        .filter(Objects::nonNull)
        .distinct()
        .collect(Collectors.toList());

        Map<Integer, List<WeaponCraftItemDTO>> materialsByRecipe = allRecipeIds.isEmpty()
                ? Map.of()
                : weaponRepository.findMaterialsByRecipeIds(allRecipeIds, language).stream()
                        .collect(Collectors.groupingBy(
                                WeaponMaterialRow::recipeId,
                                Collectors.mapping(
                                        r -> new WeaponCraftItemDTO(r.itemId(), r.name(), r.quantity()),
                                        Collectors.toList())));

        return rows.stream().map(w -> new WeaponDTO(
                w.id(), w.name(), w.weaponType(), w.rarity(), w.category(),
                w.previousWeaponId(),
                w.attack(), w.affinity(), w.defense(), w.elderseal(),
                w.slot1(), w.slot2(), w.slot3(),
                w.element1(), w.element1Attack(), w.element2(), w.element2Attack(), w.elementHidden(),
                w.craftable(), w.isFinal(),
                w.phial(), w.phialPower(), w.shelling(), w.shellingLevel(), w.kinsectBonus(), w.notes(),
                // materiais de criação (do zero)
                w.createRecipeId() != null
                        ? materialsByRecipe.getOrDefault(w.createRecipeId(), List.of())
                        : List.of(),
                // materiais de melhoria (upgrade)
                w.upgradeRecipeId() != null
                        ? materialsByRecipe.getOrDefault(w.upgradeRecipeId(), List.of())
                        : List.of()
        )).collect(Collectors.toList());
    }
}
