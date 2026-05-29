package com.asteradatabank.weapons;

import com.asteradatabank.weapons.dto.WeaponDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weapons")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WeaponController {

    private final WeaponService weaponService;

    /**
     * GET /api/weapons?lang=en
     *
     * Retorna todas as armas com nome traduzido e materiais de craft.
     */
    @GetMapping
    public ResponseEntity<List<WeaponDTO>> getAllWeapons(
            @RequestParam(required = false) String lang
    ) {
        return ResponseEntity.ok(weaponService.getAllWeapons(lang));
    }
}
