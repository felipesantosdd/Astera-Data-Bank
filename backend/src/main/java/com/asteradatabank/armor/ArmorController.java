package com.asteradatabank.armor;

import com.asteradatabank.armor.dto.ArmorSetDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monsters/{monsterId}/armor")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ArmorController {

    private final ArmorService armorService;

    /**
     * GET /api/monsters/{monsterId}/armor?lang=en
     *
     * Devolve todos os sets de armadura craftáveis a partir do monstro:
     * peças, skills, slots, resistências, bônus de set e materiais de craft.
     */
    @GetMapping
    public ResponseEntity<List<ArmorSetDTO>> getArmorByMonsterId(
            @PathVariable Integer monsterId,
            @RequestParam(required = false) String lang
    ) {
        List<ArmorSetDTO> sets = armorService.getArmorByMonsterId(monsterId, lang);
        return ResponseEntity.ok(sets);
    }
}
