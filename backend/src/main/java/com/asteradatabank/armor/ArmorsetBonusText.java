package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "armorset_bonus_text")
@Getter
@NoArgsConstructor
public class ArmorsetBonusText {

    @EmbeddedId
    private ArmorsetBonusTextId id;

    private String name;
    private String description;
}
