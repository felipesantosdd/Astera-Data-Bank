package com.asteradatabank.items;

import com.asteradatabank.items.dto.ItemSummaryDTO;
import com.asteradatabank.items.dto.LocationItemDTO;
import com.asteradatabank.items.dto.MonsterRewardDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<MonsterReward, Integer> {

    @Query("""
            SELECT new com.asteradatabank.items.dto.ItemSummaryDTO(
                i.id, it.name, i.rarity, i.iconName, i.iconColor, i.category, i.subcategory
            )
            FROM Item i
            JOIN ItemText it ON it.id.itemId = i.id AND it.id.langId = :lang
            WHERE i.category = 'material'
            ORDER BY i.id ASC
            """)
    List<ItemSummaryDTO> findAllMaterials(@Param("lang") String lang);

    /**
     * Drops do item de monstros — inclui carve, captura, quest reward, investigation etc.
     * Cross-module JOIN com MonsterText (do módulo monsters) é feito direto via JPQL,
     * já que o Hibernate enxerga todas as entidades escaneadas.
     */
    @Query("""
            SELECT new com.asteradatabank.items.dto.MonsterRewardDTO(
                mr.monsterId, mt.name, mr.rank, ct.name, mr.stack, mr.percentage
            )
            FROM MonsterReward mr
            JOIN MonsterText mt
                ON mt.id.monsterId = mr.monsterId AND mt.id.langId = :lang
            JOIN MonsterRewardConditionText ct
                ON ct.id.conditionId = mr.conditionId AND ct.id.langId = :lang
            WHERE mr.itemId = :itemId
            ORDER BY mr.percentage DESC
            """)
    List<MonsterRewardDTO> findRewardsByItemId(@Param("itemId") Integer itemId, @Param("lang") String lang);

    /**
     * Pontos de coleta do item nos mapas.
     */
    @Query("""
            SELECT new com.asteradatabank.items.dto.LocationItemDTO(
                li.locationId, lt.name, li.area, li.rank, li.stack, li.percentage, li.nodes
            )
            FROM LocationItem li
            JOIN LocationText lt
                ON lt.id.locationId = li.locationId AND lt.id.langId = :lang
            WHERE li.itemId = :itemId
            ORDER BY li.percentage DESC
            """)
    List<LocationItemDTO> findGatheringByItemId(@Param("itemId") Integer itemId, @Param("lang") String lang);
}
