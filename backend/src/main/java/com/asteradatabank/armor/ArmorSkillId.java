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
public class ArmorSkillId implements Serializable {

    @Column(name = "armor_id")
    private Integer armorId;

    @Column(name = "skilltree_id")
    private Integer skilltreeId;
}
