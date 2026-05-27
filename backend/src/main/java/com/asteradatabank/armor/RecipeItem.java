package com.asteradatabank.armor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recipe_item")
@Getter
@NoArgsConstructor
public class RecipeItem {

    @EmbeddedId
    private RecipeItemId id;

    private Integer quantity;
}
