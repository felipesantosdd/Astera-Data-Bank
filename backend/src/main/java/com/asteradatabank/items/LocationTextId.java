package com.asteradatabank.items;

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
public class LocationTextId implements Serializable {

    @Column(name = "id")
    private Integer locationId;

    @Column(name = "lang_id")
    private String langId;
}
