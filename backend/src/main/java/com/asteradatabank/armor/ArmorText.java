package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "armor_text")
@Getter
@NoArgsConstructor
public class ArmorText {

    @EmbeddedId
    private ArmorTextId id;

    private String name;
}
