package com.asteradatabank.items;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Item base. Só mapeamos os campos que usamos hoje (icon_name + icon_color).
 * Outros campos do schema (rarity, buy_price, etc.) ficam de fora — Hibernate
 * em modo validate aceita entidade com subset de colunas.
 */
@Entity
@Table(name = "item")
@Getter
@NoArgsConstructor
public class Item {

    @Id
    private Integer id;

    @Column(name = "icon_name")
    private String iconName;

    @Column(name = "icon_color")
    private String iconColor;
}
