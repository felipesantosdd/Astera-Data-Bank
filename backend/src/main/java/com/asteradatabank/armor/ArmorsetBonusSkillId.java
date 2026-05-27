package com.asteradatabank.armor;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor
@EqualsAndHashCode
public class ArmorsetBonusSkillId implements Serializable {

    @Column(name = "setbonus_id")
    private Integer setbonusId;

    @Column(name = "skilltree_id")
    private Integer skilltreeId;
}
