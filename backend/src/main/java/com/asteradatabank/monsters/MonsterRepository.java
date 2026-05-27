package com.asteradatabank.monsters;

import com.asteradatabank.monsters.dto.HitzoneDTO;
import com.asteradatabank.monsters.dto.MonsterSummaryDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MonsterRepository extends JpaRepository<Monster, Integer> {

    /**
     * Busca todos os monstros grandes com nome traduzido.
     *
     * O JPQL faz um JOIN entre Monster e MonsterText filtrando pelo idioma.
     * O "new MonsterSummaryDTO(...)" constrói o DTO direto na query,
     * sem carregar a entidade completa — isso é mais eficiente.
     *
     * @param lang código do idioma (ex: "en", "ja", "pt")
     */
    @Query("""
            SELECT m FROM Monster m
            JOIN FETCH m.texts mt
            WHERE m.id = :id AND mt.id.langId = :lang
            """)
    Optional<Monster> findByIdWithText(@Param("id") Integer id, @Param("lang") String lang);

    @Query("""
            SELECT new com.asteradatabank.monsters.dto.HitzoneDTO(
                mht.name, mh.cut, mh.impact, mh.shot,
                mh.fire, mh.water, mh.thunder, mh.ice, mh.dragon, mh.ko
            )
            FROM MonsterHitzone mh
            JOIN MonsterHitzoneText mht ON mht.id.hitzoneId = mh.id AND mht.id.langId = :lang
            WHERE mh.monsterId = :monsterId
            ORDER BY mh.id ASC
            """)
    List<HitzoneDTO> findHitzonesByMonsterIdAndLang(@Param("monsterId") Integer monsterId, @Param("lang") String lang);

    @Query("""
            SELECT new com.asteradatabank.monsters.dto.MonsterSummaryDTO(
                m.id, mt.name, m.icon,
                m.weaknessFire, m.weaknessWater, m.weaknessThunder, m.weaknessIce, m.weaknessDragon,
                m.weaknessPoison, m.weaknessSleep, m.weaknessParalysis, m.weaknessBlast, m.weaknessStun,
                m.pitfallTrap, m.shockTrap, m.vineTrap
            )
            FROM Monster m
            JOIN MonsterText mt ON mt.id.monsterId = m.id AND mt.id.langId = :lang
            WHERE m.size = 'large'
            ORDER BY m.orderId ASC
            """)
    List<MonsterSummaryDTO> findAllLargeMonsters(@Param("lang") String lang);
}
