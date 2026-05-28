package com.asteradatabank.items;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "item")
@Getter
@NoArgsConstructor
public class Item {

    @Id
    private Integer id;

    private String  category;
    private String  subcategory;
    private Integer rarity;

    @Column(name = "icon_name")
    private String iconName;

    @Column(name = "icon_color")
    private String iconColor;
}
