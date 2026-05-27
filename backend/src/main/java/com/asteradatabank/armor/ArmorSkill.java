package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "armor_skill")
@Getter
@NoArgsConstructor
public class ArmorSkill {

    @EmbeddedId
    private ArmorSkillId id;

    private Integer level;
}
