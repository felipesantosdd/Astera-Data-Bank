package com.asteradatabank.weapons;

import com.asteradatabank.weapons.dto.WeaponMaterialRow;
import com.asteradatabank.weapons.dto.WeaponRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface WeaponRepository extends JpaRepository<Weapon, Integer> {

    @Query("""
            SELECT new com.asteradatabank.weapons.dto.WeaponRow(
                w.id, wt.name, w.weaponType, w.rarity, w.category,
                w.createRecipeId, w.upgradeRecipeId, w.previousWeaponId,
                w.attack, w.affinity, w.defense, w.elderseal,
                w.slot1, w.slot2, w.slot3,
                w.element1, w.element1Attack, w.element2, w.element2Attack, w.elementHidden,
                w.craftable, w.isFinal,
                w.phial, w.phialPower, w.shelling, w.shellingLevel, w.kinsectBonus, w.notes
            )
            FROM Weapon w
            JOIN WeaponText wt ON wt.id.weaponId = w.id AND wt.id.langId = :lang
            ORDER BY w.weaponType ASC, w.id ASC
            """)
    List<WeaponRow> findAllWithName(@Param("lang") String lang);

    @Query("""
            SELECT new com.asteradatabank.weapons.dto.WeaponMaterialRow(
                ri.id.recipeId, ri.id.itemId, it.name, ri.quantity
            )
            FROM RecipeItem ri
            JOIN ItemText it ON it.id.itemId = ri.id.itemId AND it.id.langId = :lang
            WHERE ri.id.recipeId IN :recipeIds
            ORDER BY ri.id.recipeId ASC, ri.id.itemId ASC
            """)
    List<WeaponMaterialRow> findMaterialsByRecipeIds(
            @Param("recipeIds") Collection<Integer> recipeIds,
            @Param("lang") String lang
    );
}
