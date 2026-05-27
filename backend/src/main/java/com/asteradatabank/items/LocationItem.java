package com.asteradatabank.items;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "location_item")
@Getter
@NoArgsConstructor
public class LocationItem {

    @Id
    private Integer id;

    @Column(name = "location_id")
    private Integer locationId;

    private Integer area;

    private String rank;

    @Column(name = "item_id")
    private Integer itemId;

    private Integer stack;
    private Integer percentage;
    private Integer nodes;
}
