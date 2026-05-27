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
public class SkillId implements Serializable {

    @Column(name = "skilltree_id")
    private Integer skilltreeId;

    @Column(name = "lang_id")
    private String langId;

    @Column(name = "level")
    private Integer level;
}
