package com.asteradatabank.monsters;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Chave composta da tabela monster_text.
 * A tabela de textos guarda traduções por idioma, então a PK é (id + lang_id).
 */
@Embeddable
@Getter
@NoArgsConstructor
@EqualsAndHashCode
public class MonsterTextId implements Serializable {

    // Coluna "id" na tabela = FK para monster.id
    @Column(name = "id")
    private Integer monsterId;

    // Coluna "lang_id" = código do idioma, ex: "en", "pt", "ja"
    @Column(name = "lang_id")
    private String langId;
}
