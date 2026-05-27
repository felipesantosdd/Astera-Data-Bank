package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "armorset_text")
@Getter
@NoArgsConstructor
public class ArmorsetText {

    @EmbeddedId
    private ArmorsetTextId id;

    private String name;
}
