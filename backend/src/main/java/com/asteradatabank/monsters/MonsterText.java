package com.asteradatabank.monsters;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Representa uma linha da tabela monster_text.
 * Cada monstro tem uma entrada por idioma suportado (en, pt, ja, etc).
 */
@Entity
@Table(name = "monster_text")
@Getter
@NoArgsConstructor
public class MonsterText {

    @EmbeddedId
    private MonsterTextId id;

    private String name;
    private String ecology;
    private String description;

    @Column(name = "alt_state_description")
    private String altStateDescription;

    // Relacionamento de volta ao Monster (lazy = só carrega se pedido)
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("monsterId")   // mapeia o campo monsterId do MonsterTextId
    @JoinColumn(name = "id")
    private Monster monster;
}
