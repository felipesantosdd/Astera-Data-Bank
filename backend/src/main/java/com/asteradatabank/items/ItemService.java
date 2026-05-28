package com.asteradatabank.items;

import com.asteradatabank.LangUtil;
import com.asteradatabank.items.dto.ItemSourcesDTO;
import com.asteradatabank.items.dto.ItemSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;

    /**
     * Devolve todas as fontes de um item: drops de monstros e pontos de coleta.
     */
    public List<ItemSummaryDTO> getItems(String lang) {
        return itemRepository.findAllMaterials(LangUtil.normalize(lang));
    }

    public ItemSourcesDTO getItemSources(Integer itemId, String lang) {
        String language = LangUtil.normalize(lang);

        return new ItemSourcesDTO(
                itemRepository.findRewardsByItemId(itemId, language),
                itemRepository.findGatheringByItemId(itemId, language)
        );
    }
}
