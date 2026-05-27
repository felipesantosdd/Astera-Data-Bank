package com.asteradatabank.items;

import com.asteradatabank.LangUtil;
import com.asteradatabank.items.dto.ItemSourcesDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;

    /**
     * Devolve todas as fontes de um item: drops de monstros e pontos de coleta.
     */
    public ItemSourcesDTO getItemSources(Integer itemId, String lang) {
        String language = LangUtil.normalize(lang);

        return new ItemSourcesDTO(
                itemRepository.findRewardsByItemId(itemId, language),
                itemRepository.findGatheringByItemId(itemId, language)
        );
    }
}
