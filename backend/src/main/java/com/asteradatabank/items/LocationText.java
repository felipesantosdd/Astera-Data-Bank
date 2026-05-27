package com.asteradatabank.items;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "location_text")
@Getter
@NoArgsConstructor
public class LocationText {

    @EmbeddedId
    private LocationTextId id;

    private String name;
}
