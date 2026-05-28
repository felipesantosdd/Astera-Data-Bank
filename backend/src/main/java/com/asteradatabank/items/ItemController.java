package com.asteradatabank.items;

import com.asteradatabank.items.dto.ItemSourcesDTO;
import com.asteradatabank.items.dto.ItemSummaryDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ItemController {

    private final ItemService itemService;

    /**
     * GET /api/items/{id}/sources?lang=en
     *
     * Devolve onde encontrar o item: drops de monstros + pontos de coleta em mapas.
     */
    /** GET /api/items?lang=en — lista de todos os materiais */
    @GetMapping
    public ResponseEntity<List<ItemSummaryDTO>> getItems(
            @RequestParam(required = false) String lang
    ) {
        return ResponseEntity.ok(itemService.getItems(lang));
    }

    @GetMapping("/{id}/sources")
    public ResponseEntity<ItemSourcesDTO> getItemSources(
            @PathVariable Integer id,
            @RequestParam(required = false) String lang
    ) {
        return ResponseEntity.ok(itemService.getItemSources(id, lang));
    }
}
