package com.asteradatabank.weapons;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "weapon_text")
@Getter
@NoArgsConstructor
public class WeaponText {

    @EmbeddedId
    private WeaponTextId id;

    private String name;
}
