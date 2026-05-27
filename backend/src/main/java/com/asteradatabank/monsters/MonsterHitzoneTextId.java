package com.asteradatabank.monsters;

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
public class MonsterHitzoneTextId implements Serializable {

    @Column(name = "id")
    private Integer hitzoneId;

    @Column(name = "lang_id")
    private String langId;
}
