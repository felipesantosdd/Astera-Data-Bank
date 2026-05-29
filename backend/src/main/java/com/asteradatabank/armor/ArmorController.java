package com.asteradatabank.armor;

import com.asteradatabank.armor.dto.ArmorSetDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ArmorController {

    private final ArmorService armorService;

    /**
     * GET /api/armor?lang=en
     *
     * Retorna todos os sets de armadura do jogo.
     */
    @GetMapping("/api/armor")
    public ResponseEntity<List<ArmorSetDTO>> getAllArmor(
            @RequestParam(required = false) String lang
    ) {
        return ResponseEntity.ok(armorService.getAllArmor(lang));
    }

    /**
     * GET /api/monsters/{monsterId}/armor?lang=en
     *
     * Devolve todos os sets de armadura craftáveis a partir do monstro.
     */
    @GetMapping("/api/monsters/{monsterId}/armor")
    public ResponseEntity<List<ArmorSetDTO>> getArmorByMonsterId(
            @PathVariable Integer monsterId,
            @RequestParam(required = false) String lang
    ) {
        return ResponseEntity.ok(armorService.getArmorByMonsterId(monsterId, lang));
    }
}
