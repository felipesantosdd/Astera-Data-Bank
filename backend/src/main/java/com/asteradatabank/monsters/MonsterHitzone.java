package com.asteradatabank.monsters;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "monster_hitzone")
@Getter
@NoArgsConstructor
public class MonsterHitzone {

    @Id
    private Integer id;

    @Column(name = "monster_id")
    private Integer monsterId;

    private Integer cut;
    private Integer impact;
    private Integer shot;
    private Integer fire;
    private Integer water;
    private Integer ice;
    private Integer thunder;
    private Integer dragon;
    private Integer ko;
}
