package com.asteradatabank.items.dto;

import java.util.List;

public record ItemSourcesDTO(
        List<MonsterRewardDTO> rewards,
        List<LocationItemDTO>  gathering
) {}
