package com.asteradatabank.monsters;

import com.asteradatabank.monsters.dto.HitzoneDTO;
import com.asteradatabank.monsters.dto.MonsterDropRow;
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

    /**
     * Drops/recompensas que o monstro derruba.
     *
     * Faz dois JOINs com MonsterRewardConditionText: um na lang escolhida (pro
     * texto exibido) e outro fixo em 'en' — o service usa o nome inglês pra
     * derivar a categoria de agrupamento (carve, break, etc) de forma estável
     * mesmo trocando de idioma.
     */
    @Query("""
            SELECT new com.asteradatabank.monsters.dto.MonsterDropRow(
                mr.itemId, it.name, i.iconName, i.iconColor,
                mr.rank, ctEn.name, ct.name, mr.stack, mr.percentage
            )
            FROM MonsterReward mr
            JOIN ItemText it
                ON it.id.itemId = mr.itemId AND it.id.langId = :lang
            JOIN MonsterRewardConditionText ct
                ON ct.id.conditionId = mr.conditionId AND ct.id.langId = :lang
            JOIN MonsterRewardConditionText ctEn
                ON ctEn.id.conditionId = mr.conditionId AND ctEn.id.langId = 'en'
            LEFT JOIN Item i ON i.id = mr.itemId
            WHERE mr.monsterId = :monsterId
            ORDER BY mr.percentage DESC
            """)
    List<MonsterDropRow> findDropsByMonsterId(@Param("monsterId") Integer monsterId, @Param("lang") String lang);

    /**
     * Carrega entidades completas com tradução — o mapeamento para
     * MonsterSummaryDTO (incluindo ecology e elements derivados) é feito
     * no MonsterService para manter o DTO limpo de lógica JPQL.
     */
    @Query("""
            SELECT m FROM Monster m
            JOIN FETCH m.texts mt
            WHERE m.size = 'large' AND mt.id.langId = :lang
            ORDER BY m.orderId ASC
            """)
    List<Monster> findAllLargeMonsters(@Param("lang") String lang);
}
