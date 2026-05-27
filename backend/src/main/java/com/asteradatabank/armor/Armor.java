package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "armor")
@Getter
@NoArgsConstructor
public class Armor {

    @Id
    private Integer id;

    @Column(name = "order_id")
    private Integer orderId;

    private Integer rarity;

    private String rank;

    // "head" | "chest" | "arms" | "waist" | "legs"
    @Column(name = "armor_type")
    private String armorType;

    @Column(name = "armorset_id")
    private Integer armorsetId;

    @Column(name = "recipe_id")
    private Integer recipeId;

    @Column(name = "slot_1") private Integer slot1;
    @Column(name = "slot_2") private Integer slot2;
    @Column(name = "slot_3") private Integer slot3;

    @Column(name = "defense_base")        private Integer defenseBase;
    @Column(name = "defense_max")         private Integer defenseMax;
    @Column(name = "defense_augment_max") private Integer defenseAugmentMax;

    private Integer fire;
    private Integer water;
    private Integer thunder;
    private Integer ice;
    private Integer dragon;
}
