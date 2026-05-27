package com.asteradatabank.items;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "monster_reward_condition_text")
@Getter
@NoArgsConstructor
public class MonsterRewardConditionText {

    @EmbeddedId
    private MonsterRewardConditionTextId id;

    private String name;
}
