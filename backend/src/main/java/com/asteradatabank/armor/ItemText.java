package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "item_text")
@Getter
@NoArgsConstructor
public class ItemText {

    @EmbeddedId
    private ItemTextId id;

    private String name;
}
