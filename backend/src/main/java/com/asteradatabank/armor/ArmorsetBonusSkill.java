package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "armorset_bonus_skill")
@Getter
@NoArgsConstructor
public class ArmorsetBonusSkill {

    @EmbeddedId
    private ArmorsetBonusSkillId id;

    private Integer required;
}
