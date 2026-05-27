package com.asteradatabank.monsters;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Representa um monstro do MHW.
 * Mapeado para a tabela "monster" do banco de dados.
 *
 * As fraquezas usam a escala do jogo:
 *   0 = imune, 1 = fraco, 2 = médio, 3 = forte, 4 = muito forte, 5 = extremo
 */
@Entity
@Table(name = "monster")
@Getter
@NoArgsConstructor
public class Monster {

    @Id
    private Integer id;

    // Define a ordem de exibição no jogo
    @Column(name = "order_id")
    private Integer orderId;

    // "small" ou "large"
    private String size;

    // Nome do arquivo de ícone
    private String icon;

    // ── Armadilhas ────────────────────────────────────────────────────────────
    @Column(name = "pitfall_trap")
    private Boolean pitfallTrap;

    @Column(name = "shock_trap")
    private Boolean shockTrap;

    @Column(name = "vine_trap")
    private Boolean vineTrap;

    // ── Fraquezas elementais ──────────────────────────────────────────────────
    @Column(name = "weakness_fire")
    private Integer weaknessFire;

    @Column(name = "weakness_water")
    private Integer weaknessWater;

    @Column(name = "weakness_thunder")
    private Integer weaknessThunder;

    @Column(name = "weakness_ice")
    private Integer weaknessIce;

    @Column(name = "weakness_dragon")
    private Integer weaknessDragon;

    // ── Fraquezas de status ───────────────────────────────────────────────────
    @Column(name = "weakness_poison")
    private Integer weaknessPoison;

    @Column(name = "weakness_sleep")
    private Integer weaknessSleep;

    @Column(name = "weakness_paralysis")
    private Integer weaknessParalysis;

    @Column(name = "weakness_blast")
    private Integer weaknessBlast;

    @Column(name = "weakness_stun")
    private Integer weaknessStun;

    // ── Estado alterado (ex: Bazelgeuse enraivecido, Brachydios em modo raiva) ─
    @Column(name = "has_alt_weakness")
    private Boolean hasAltWeakness;

    @Column(name = "alt_weakness_fire")      private Integer altWeaknessFire;
    @Column(name = "alt_weakness_water")     private Integer altWeaknessWater;
    @Column(name = "alt_weakness_thunder")   private Integer altWeaknessThunder;
    @Column(name = "alt_weakness_ice")       private Integer altWeaknessIce;
    @Column(name = "alt_weakness_dragon")    private Integer altWeaknessDragon;
    @Column(name = "alt_weakness_poison")    private Integer altWeaknessPoison;
    @Column(name = "alt_weakness_sleep")     private Integer altWeaknessSleep;
    @Column(name = "alt_weakness_paralysis") private Integer altWeaknessParalysis;
    @Column(name = "alt_weakness_blast")     private Integer altWeaknessBlast;
    @Column(name = "alt_weakness_stun")      private Integer altWeaknessStun;

    // ── Ailments que o monstro inflige no jogador ─────────────────────────────
    @Column(name = "ailment_roar")         private String  ailmentRoar;
    @Column(name = "ailment_wind")         private String  ailmentWind;
    @Column(name = "ailment_tremor")       private String  ailmentTremor;
    @Column(name = "ailment_defensedown")  private Boolean ailmentDefenseDown;
    @Column(name = "ailment_fireblight")   private Boolean ailmentFireblight;
    @Column(name = "ailment_waterblight")  private Boolean ailmentWaterblight;
    @Column(name = "ailment_thunderblight")private Boolean ailmentThunderblight;
    @Column(name = "ailment_iceblight")    private Boolean ailmentIceblight;
    @Column(name = "ailment_dragonblight") private Boolean ailmentDragonblight;
    @Column(name = "ailment_blastblight")  private Boolean ailmentBlastblight;
    @Column(name = "ailment_regional")     private Boolean ailmentRegional;
    @Column(name = "ailment_poison")       private Boolean ailmentPoison;
    @Column(name = "ailment_sleep")        private Boolean ailmentSleep;
    @Column(name = "ailment_paralysis")    private Boolean ailmentParalysis;
    @Column(name = "ailment_bleed")        private Boolean ailmentBleed;
    @Column(name = "ailment_stun")         private Boolean ailmentStun;
    @Column(name = "ailment_mud")          private Boolean ailmentMud;
    @Column(name = "ailment_effluvia")     private Boolean ailmentEffluvia;

    // ── Traduções (lazy: só carrega quando pedido explicitamente) ─────────────
    @OneToMany(mappedBy = "monster", fetch = FetchType.LAZY)
    private List<MonsterText> texts;
}
