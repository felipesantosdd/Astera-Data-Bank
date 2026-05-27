package com.asteradatabank.items.dto;

public record LocationItemDTO(
        Integer locationId,
        String  locationName,
        Integer area,
        String  rank,
        Integer stack,
        Integer percentage,
        Integer nodes
) {}
