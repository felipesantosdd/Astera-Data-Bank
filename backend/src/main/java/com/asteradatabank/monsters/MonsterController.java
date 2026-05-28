package com.asteradatabank.monsters;

import com.asteradatabank.monsters.dto.MonsterDetailDTO;
import com.asteradatabank.monsters.dto.MonsterDropDTO;
import com.asteradatabank.monsters.dto.MonsterSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monsters")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // permite o frontend Vue acessar
public class MonsterController {

    private final MonsterService monsterService;

    /**
     * GET /api/monsters
     * GET /api/monsters?lang=en
     *
     * Retorna todos os monstros grandes do MHW.
     * O parâmetro "lang" é opcional — padrão é "en".
     */
    @GetMapping
    public ResponseEntity<List<MonsterSummaryDTO>> getLargeMonsters(
            @RequestParam(required = false) String lang
    ) {
        List<MonsterSummaryDTO> monsters = monsterService.getLargeMonsters(lang);
        return ResponseEntity.ok(monsters);
    }

    /**
     * GET /api/monsters/{id}
     * GET /api/monsters/{id}?lang=en
     *
     * Retorna os detalhes completos de um monstro específico:
     * info geral, fraquezas (normais + estado alterado), armadilhas,
     * ailments inflingidos no jogador e hitzones (partes do corpo).
     */
    @GetMapping("/{id}")
    public ResponseEntity<MonsterDetailDTO> getMonsterById(
            @PathVariable Integer id,
            @RequestParam(required = false) String lang
    ) {
        MonsterDetailDTO monster = monsterService.getMonsterById(id, lang);
        return ResponseEntity.ok(monster);
    }

    /**
     * GET /api/monsters/{id}/drops?lang=en
     *
     * Devolve todos os drops/recompensas do monstro, em ordem decrescente de chance.
     * O frontend agrupa por rank e por tipo de obtenção (Carve, Capture, etc).
     */
    @GetMapping("/{id}/drops")
    public ResponseEntity<List<MonsterDropDTO>> getDropsByMonsterId(
            @PathVariable Integer id,
            @RequestParam(required = false) String lang
    ) {
        return ResponseEntity.ok(monsterService.getDropsByMonsterId(id, lang));
    }
}
