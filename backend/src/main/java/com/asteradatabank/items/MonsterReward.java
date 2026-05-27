package com.asteradatabank.items;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "monster_reward")
@Getter
@NoArgsConstructor
public class MonsterReward {

    @Id
    private Integer id;

    @Column(name = "monster_id")
    private Integer monsterId;

    @Column(name = "condition_id")
    private Integer conditionId;

    private String rank;

    @Column(name = "item_id")
    private Integer itemId;

    private Integer stack;
    private Integer percentage;
}
