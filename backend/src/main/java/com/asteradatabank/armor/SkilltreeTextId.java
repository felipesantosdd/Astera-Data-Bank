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
public class SkilltreeTextId implements Serializable {

    @Column(name = "id")
    private Integer skilltreeId;

    @Column(name = "lang_id")
    private String langId;
}
