package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "skilltree_text")
@Getter
@NoArgsConstructor
public class SkilltreeText {

    @EmbeddedId
    private SkilltreeTextId id;

    private String name;
    private String description;
}
