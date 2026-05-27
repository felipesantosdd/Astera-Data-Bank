package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "armorset")
@Getter
@NoArgsConstructor
public class Armorset {

    @Id
    private Integer id;

    // "LR" | "HR" | "MR"
    private String rank;

    @Column(name = "monster_id")
    private Integer monsterId;

    @Column(name = "armorset_bonus_id")
    private Integer armorsetBonusId;
}
