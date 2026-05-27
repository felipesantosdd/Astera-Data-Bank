package com.asteradatabank.armor;

import com.asteradatabank.armor.dto.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ArmorRepository extends JpaRepository<Armorset, Integer> {

    /**
     * Sets de armadura de um monstro, traduzidos.
     */
    @Query("""
            SELECT new com.asteradatabank.armor.dto.ArmorSetRow(
                s.id, st.name, s.rank, s.armorsetBonusId
            )
            FROM Armorset s
            JOIN ArmorsetText st ON st.id.armorsetId = s.id AND st.id.langId = :lang
            WHERE s.monsterId = :monsterId
            ORDER BY s.id ASC
            """)
    List<ArmorSetRow> findSetsByMonsterId(@Param("monsterId") Integer monsterId, @Param("lang") String lang);

    /**
     * Peças de armadura de um conjunto de sets.
     */
    @Query("""
            SELECT new com.asteradatabank.armor.dto.ArmorPieceRow(
                a.id, at.name, a.armorType, a.rarity,
                a.defenseBase, a.defenseMax, a.defenseAugmentMax,
                a.fire, a.water, a.thunder, a.ice, a.dragon,
                a.slot1, a.slot2, a.slot3,
                a.armorsetId, a.recipeId
            )
            FROM Armor a
            JOIN ArmorText at ON at.id.armorId = a.id AND at.id.langId = :lang
            WHERE a.armorsetId IN :setIds
            ORDER BY a.armorsetId ASC, a.orderId ASC
            """)
    List<ArmorPieceRow> findPiecesBySetIds(@Param("setIds") Collection<Integer> setIds, @Param("lang") String lang);

    /**
     * Skills aplicadas em um conjunto de peças, com nome traduzido e nível.
     */
    @Query("""
            SELECT new com.asteradatabank.armor.dto.ArmorSkillRow(
                asl.id.armorId, asl.id.skilltreeId, stxt.name, stxt.description, asl.level
            )
            FROM ArmorSkill asl
            JOIN SkilltreeText stxt ON stxt.id.skilltreeId = asl.id.skilltreeId AND stxt.id.langId = :lang
            WHERE asl.id.armorId IN :armorIds
            """)
    List<ArmorSkillRow> findSkillsByArmorIds(@Param("armorIds") Collection<Integer> armorIds, @Param("lang") String lang);

    /**
     * Materiais (item + quantidade) necessários para craft de cada receita.
     */
    @Query("""
            SELECT new com.asteradatabank.armor.dto.ArmorMaterialRow(
                ri.id.recipeId, ri.id.itemId, it.name, ri.quantity
            )
            FROM RecipeItem ri
            JOIN ItemText it ON it.id.itemId = ri.id.itemId AND it.id.langId = :lang
            WHERE ri.id.recipeId IN :recipeIds
            ORDER BY ri.id.recipeId ASC, ri.id.itemId ASC
            """)
    List<ArmorMaterialRow> findMaterialsByRecipeIds(@Param("recipeIds") Collection<Integer> recipeIds, @Param("lang") String lang);

    /**
     * Bônus dos sets (nome + descrição) — armorset_bonus_id pode ser null quando o set não tem bônus.
     */
    @Query("""
            SELECT new com.asteradatabank.armor.dto.ArmorSetBonusRow(
                abt.id.armorsetBonusId, abt.name, abt.description
            )
            FROM ArmorsetBonusText abt
            WHERE abt.id.armorsetBonusId IN :bonusIds AND abt.id.langId = :lang
            """)
    List<ArmorSetBonusRow> findBonusesByIds(@Param("bonusIds") Collection<Integer> bonusIds, @Param("lang") String lang);

    /**
     * Skills do bônus + quantas peças do set são necessárias pra ativar.
     */
    @Query("""
            SELECT new com.asteradatabank.armor.dto.ArmorSetBonusSkillRow(
                abs.id.setbonusId, abs.id.skilltreeId, stxt.name, stxt.description, abs.required
            )
            FROM ArmorsetBonusSkill abs
            JOIN SkilltreeText stxt ON stxt.id.skilltreeId = abs.id.skilltreeId AND stxt.id.langId = :lang
            WHERE abs.id.setbonusId IN :bonusIds
            ORDER BY abs.required ASC
            """)
    List<ArmorSetBonusSkillRow> findBonusSkillsByIds(@Param("bonusIds") Collection<Integer> bonusIds, @Param("lang") String lang);

    /**
     * Descrição de cada nível de uma skill — usado pra montar o tooltip
     * mostrando o que cada level faz.
     */
    @Query("""
            SELECT new com.asteradatabank.armor.dto.SkillLevelRow(
                s.id.skilltreeId, s.id.level, s.description
            )
            FROM Skill s
            WHERE s.id.skilltreeId IN :skilltreeIds AND s.id.langId = :lang
            ORDER BY s.id.skilltreeId ASC, s.id.level ASC
            """)
    List<SkillLevelRow> findLevelsBySkilltreeIds(@Param("skilltreeIds") Collection<Integer> skilltreeIds, @Param("lang") String lang);
}
