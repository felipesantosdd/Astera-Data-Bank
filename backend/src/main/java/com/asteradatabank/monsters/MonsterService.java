package com.asteradatabank.monsters;

import com.asteradatabank.LangUtil;
import com.asteradatabank.monsters.dto.HitzoneDTO;
import com.asteradatabank.monsters.dto.MonsterDetailDTO;
import com.asteradatabank.monsters.dto.MonsterDropDTO;
import com.asteradatabank.monsters.dto.MonsterSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MonsterService {

    private final MonsterRepository monsterRepository;

    public List<MonsterSummaryDTO> getLargeMonsters(String lang) {
        String language = LangUtil.normalize(lang);
        return monsterRepository.findAllLargeMonsters(language).stream()
                .map(m -> {
                    MonsterText mt = m.getTexts().get(0);
                    return new MonsterSummaryDTO(
                            m.getId(), mt.getName(), m.getIcon(),
                            mt.getEcology(),
                            deriveElements(m),
                            m.getWeaknessFire(), m.getWeaknessWater(), m.getWeaknessThunder(),
                            m.getWeaknessIce(), m.getWeaknessDragon(),
                            m.getWeaknessPoison(), m.getWeaknessSleep(), m.getWeaknessParalysis(),
                            m.getWeaknessBlast(), m.getWeaknessStun(),
                            m.getPitfallTrap(), m.getShockTrap(), m.getVineTrap()
                    );
                })
                .toList();
    }

    public MonsterDetailDTO getMonsterById(Integer id, String lang) {
        String language = LangUtil.normalize(lang);

        Monster m = monsterRepository.findByIdWithText(id, language)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monster not found"));

        MonsterText mt = m.getTexts().get(0);

        List<HitzoneDTO> hitzones = monsterRepository.findHitzonesByMonsterIdAndLang(id, language);

        return new MonsterDetailDTO(
                m.getId(), mt.getName(), m.getIcon(),
                mt.getEcology(), mt.getDescription(), mt.getAltStateDescription(),

                m.getWeaknessFire(), m.getWeaknessWater(), m.getWeaknessThunder(),
                m.getWeaknessIce(), m.getWeaknessDragon(),
                m.getWeaknessPoison(), m.getWeaknessSleep(), m.getWeaknessParalysis(),
                m.getWeaknessBlast(), m.getWeaknessStun(),

                m.getHasAltWeakness(),
                m.getAltWeaknessFire(), m.getAltWeaknessWater(), m.getAltWeaknessThunder(),
                m.getAltWeaknessIce(), m.getAltWeaknessDragon(),
                m.getAltWeaknessPoison(), m.getAltWeaknessSleep(), m.getAltWeaknessParalysis(),
                m.getAltWeaknessBlast(), m.getAltWeaknessStun(),

                m.getPitfallTrap(), m.getShockTrap(), m.getVineTrap(),

                m.getAilmentRoar(), m.getAilmentWind(), m.getAilmentTremor(),
                m.getAilmentDefenseDown(), m.getAilmentFireblight(), m.getAilmentWaterblight(),
                m.getAilmentThunderblight(), m.getAilmentIceblight(), m.getAilmentDragonblight(),
                m.getAilmentBlastblight(), m.getAilmentPoison(), m.getAilmentSleep(),
                m.getAilmentParalysis(), m.getAilmentBleed(), m.getAilmentStun(),
                m.getAilmentMud(), m.getAilmentEffluvia(),

                hitzones
        );
    }

    public List<MonsterDropDTO> getDropsByMonsterId(Integer monsterId, String lang) {
        String language = LangUtil.normalize(lang);
        return monsterRepository.findDropsByMonsterId(monsterId, language).stream()
                .map(r -> new MonsterDropDTO(
                        r.itemId(), r.itemName(), r.iconName(), r.iconColor(),
                        r.rank(),
                        DropSourceMapper.fromEnglishCondition(r.conditionEn()),
                        r.condition(),
                        r.stack(), r.percentage()
                ))
                .toList();
    }

    /**
     * Deriva os elementos ofensivos do monstro a partir dos ailments de blight
     * que ele inflige no jogador. Vazio = monstro físico / sem elemento.
     *
     * Exemplo: Teostra → ["fire", "blast"]
     *          Nergigante → []
     *          Kushala Daora → ["ice", "water"]
     */
    private List<String> deriveElements(Monster m) {
        List<String> elements = new ArrayList<>();
        if (Boolean.TRUE.equals(m.getAilmentFireblight()))    elements.add("fire");
        if (Boolean.TRUE.equals(m.getAilmentWaterblight()))   elements.add("water");
        if (Boolean.TRUE.equals(m.getAilmentThunderblight())) elements.add("thunder");
        if (Boolean.TRUE.equals(m.getAilmentIceblight()))     elements.add("ice");
        if (Boolean.TRUE.equals(m.getAilmentDragonblight()))  elements.add("dragon");
        if (Boolean.TRUE.equals(m.getAilmentBlastblight()))   elements.add("blast");
        if (Boolean.TRUE.equals(m.getAilmentPoison()))        elements.add("poison");
        if (Boolean.TRUE.equals(m.getAilmentSleep()))         elements.add("sleep");
        if (Boolean.TRUE.equals(m.getAilmentParalysis()))     elements.add("paralysis");
        return elements;
    }
}
