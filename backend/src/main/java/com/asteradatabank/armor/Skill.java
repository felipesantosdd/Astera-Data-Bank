package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "skill")
@Getter
@NoArgsConstructor
public class Skill {

    @EmbeddedId
    private SkillId id;

    private String description;
}
