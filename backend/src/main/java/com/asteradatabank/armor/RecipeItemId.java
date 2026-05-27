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
public class RecipeItemId implements Serializable {

    @Column(name = "recipe_id")
    private Integer recipeId;

    @Column(name = "item_id")
    private Integer itemId;
}
