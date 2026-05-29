package com.asteradatabank.weapons;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "weapon")
@Getter
@NoArgsConstructor
public class Weapon {

    @Id
    private Integer id;

    @Column(name = "weapon_type")  private String weaponType;
    @Column(name = "rarity")       private Integer rarity;
    @Column(name = "category")     private String category;

    @Column(name = "create_recipe_id")   private Integer createRecipeId;
    @Column(name = "upgrade_recipe_id")  private Integer upgradeRecipeId;
    @Column(name = "previous_weapon_id") private Integer previousWeaponId;

    @Column(name = "attack")       private Integer attack;
    @Column(name = "affinity")     private Integer affinity;
    @Column(name = "defense")      private Integer defense;
    @Column(name = "elderseal")    private String elderseal;

    @Column(name = "slot_1")       private Integer slot1;
    @Column(name = "slot_2")       private Integer slot2;
    @Column(name = "slot_3")       private Integer slot3;

    @Column(name = "element1")         private String element1;
    @Column(name = "element1_attack")  private Integer element1Attack;
    @Column(name = "element2")         private String element2;
    @Column(name = "element2_attack")  private Integer element2Attack;
    @Column(name = "element_hidden")   private Boolean elementHidden;

    @Column(name = "craftable") private Boolean craftable;
    @Column(name = "final")     private Boolean isFinal;

    // Weapon-type specific fields
    @Column(name = "phial")         private String phial;
    @Column(name = "phial_power")   private Integer phialPower;
    @Column(name = "shelling")      private String shelling;
    @Column(name = "shelling_level") private Integer shellingLevel;
    @Column(name = "kinsect_bonus") private String kinsectBonus;
    @Column(name = "notes")         private String notes;

    @Column(name = "armorset_bonus_id") private Integer armorsetBonusId;
}
