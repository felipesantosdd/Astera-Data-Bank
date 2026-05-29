package com.asteradatabank.weapons;

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
public class WeaponTextId implements Serializable {

    @Column(name = "id")
    private Integer weaponId;

    @Column(name = "lang_id")
    private String langId;
}
