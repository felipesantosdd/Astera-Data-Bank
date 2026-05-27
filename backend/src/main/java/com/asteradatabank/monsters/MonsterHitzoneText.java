package com.asteradatabank.monsters;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "monster_hitzone_text")
@Getter
@NoArgsConstructor
public class MonsterHitzoneText {

    @EmbeddedId
    private MonsterHitzoneTextId id;

    private String name;
}
