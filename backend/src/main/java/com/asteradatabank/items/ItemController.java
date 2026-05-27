package com.asteradatabank.items;

import com.asteradatabank.items.dto.ItemSourcesDTO;
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
    @GetMapping("/{id}/sources")
    public ResponseEntity<ItemSourcesDTO> getItemSources(
            @PathVariable Integer id,
            @RequestParam(required = false) String lang
    ) {
        return ResponseEntity.ok(itemService.getItemSources(id, lang));
    }
}
