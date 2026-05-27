-- V2: MHWorldData schema (auto-gerado de mhdata/mhw.db)
-- Fonte: https://github.com/gatheringhallstudios/MHWorldData (V46)
-- Importar os dados: python scripts/import_mhdata.py

CREATE TABLE IF NOT EXISTS "item" (
    "id" INTEGER NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "rarity" INTEGER,
    "buy_price" INTEGER,
    "sell_price" INTEGER,
    "carry_limit" INTEGER,
    "points" INTEGER,
    "icon_name" TEXT,
    "icon_color" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "language" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "is_complete" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "monster" (
    "id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "size" TEXT,
    "icon" TEXT,
    "pitfall_trap" BOOLEAN,
    "shock_trap" BOOLEAN,
    "vine_trap" BOOLEAN,
    "has_weakness" BOOLEAN,
    "has_alt_weakness" BOOLEAN,
    "weakness_fire" INTEGER,
    "weakness_water" INTEGER,
    "weakness_ice" INTEGER,
    "weakness_thunder" INTEGER,
    "weakness_dragon" INTEGER,
    "weakness_poison" INTEGER,
    "weakness_sleep" INTEGER,
    "weakness_paralysis" INTEGER,
    "weakness_blast" INTEGER,
    "weakness_stun" INTEGER,
    "alt_weakness_fire" INTEGER,
    "alt_weakness_water" INTEGER,
    "alt_weakness_ice" INTEGER,
    "alt_weakness_thunder" INTEGER,
    "alt_weakness_dragon" INTEGER,
    "alt_weakness_poison" INTEGER,
    "alt_weakness_sleep" INTEGER,
    "alt_weakness_paralysis" INTEGER,
    "alt_weakness_blast" INTEGER,
    "alt_weakness_stun" INTEGER,
    "ailment_roar" TEXT,
    "ailment_wind" TEXT,
    "ailment_tremor" TEXT,
    "ailment_defensedown" BOOLEAN,
    "ailment_fireblight" BOOLEAN,
    "ailment_waterblight" BOOLEAN,
    "ailment_thunderblight" BOOLEAN,
    "ailment_iceblight" BOOLEAN,
    "ailment_dragonblight" BOOLEAN,
    "ailment_blastblight" BOOLEAN,
    "ailment_regional" BOOLEAN,
    "ailment_poison" BOOLEAN,
    "ailment_sleep" BOOLEAN,
    "ailment_paralysis" BOOLEAN,
    "ailment_bleed" BOOLEAN,
    "ailment_stun" BOOLEAN,
    "ailment_mud" BOOLEAN,
    "ailment_effluvia" BOOLEAN,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "skilltree" (
    "id" INTEGER NOT NULL,
    "max_level" INTEGER,
    "icon_color" TEXT,
    "secret" INTEGER,
    "unlocks_id" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "weapon_ammo" (
    "id" INTEGER NOT NULL,
    "deviation" TEXT,
    "special_ammo" TEXT,
    "normal1_clip" INTEGER,
    "normal1_rapid" BOOLEAN,
    "normal1_recoil" INTEGER,
    "normal1_reload" TEXT,
    "normal2_clip" INTEGER,
    "normal2_rapid" BOOLEAN,
    "normal2_recoil" INTEGER,
    "normal2_reload" TEXT,
    "normal3_clip" INTEGER,
    "normal3_rapid" BOOLEAN,
    "normal3_recoil" INTEGER,
    "normal3_reload" TEXT,
    "pierce1_clip" INTEGER,
    "pierce1_rapid" BOOLEAN,
    "pierce1_recoil" INTEGER,
    "pierce1_reload" TEXT,
    "pierce2_clip" INTEGER,
    "pierce2_rapid" BOOLEAN,
    "pierce2_recoil" INTEGER,
    "pierce2_reload" TEXT,
    "pierce3_clip" INTEGER,
    "pierce3_rapid" BOOLEAN,
    "pierce3_recoil" INTEGER,
    "pierce3_reload" TEXT,
    "spread1_clip" INTEGER,
    "spread1_rapid" BOOLEAN,
    "spread1_recoil" INTEGER,
    "spread1_reload" TEXT,
    "spread2_clip" INTEGER,
    "spread2_rapid" BOOLEAN,
    "spread2_recoil" INTEGER,
    "spread2_reload" TEXT,
    "spread3_clip" INTEGER,
    "spread3_rapid" BOOLEAN,
    "spread3_recoil" INTEGER,
    "spread3_reload" TEXT,
    "sticky1_clip" INTEGER,
    "sticky1_rapid" BOOLEAN,
    "sticky1_recoil" INTEGER,
    "sticky1_reload" TEXT,
    "sticky2_clip" INTEGER,
    "sticky2_rapid" BOOLEAN,
    "sticky2_recoil" INTEGER,
    "sticky2_reload" TEXT,
    "sticky3_clip" INTEGER,
    "sticky3_rapid" BOOLEAN,
    "sticky3_recoil" INTEGER,
    "sticky3_reload" TEXT,
    "cluster1_clip" INTEGER,
    "cluster1_rapid" BOOLEAN,
    "cluster1_recoil" INTEGER,
    "cluster1_reload" TEXT,
    "cluster2_clip" INTEGER,
    "cluster2_rapid" BOOLEAN,
    "cluster2_recoil" INTEGER,
    "cluster2_reload" TEXT,
    "cluster3_clip" INTEGER,
    "cluster3_rapid" BOOLEAN,
    "cluster3_recoil" INTEGER,
    "cluster3_reload" TEXT,
    "recover1_clip" INTEGER,
    "recover1_rapid" BOOLEAN,
    "recover1_recoil" INTEGER,
    "recover1_reload" TEXT,
    "recover2_clip" INTEGER,
    "recover2_rapid" BOOLEAN,
    "recover2_recoil" INTEGER,
    "recover2_reload" TEXT,
    "poison1_clip" INTEGER,
    "poison1_rapid" BOOLEAN,
    "poison1_recoil" INTEGER,
    "poison1_reload" TEXT,
    "poison2_clip" INTEGER,
    "poison2_rapid" BOOLEAN,
    "poison2_recoil" INTEGER,
    "poison2_reload" TEXT,
    "paralysis1_clip" INTEGER,
    "paralysis1_rapid" BOOLEAN,
    "paralysis1_recoil" INTEGER,
    "paralysis1_reload" TEXT,
    "paralysis2_clip" INTEGER,
    "paralysis2_rapid" BOOLEAN,
    "paralysis2_recoil" INTEGER,
    "paralysis2_reload" TEXT,
    "sleep1_clip" INTEGER,
    "sleep1_rapid" BOOLEAN,
    "sleep1_recoil" INTEGER,
    "sleep1_reload" TEXT,
    "sleep2_clip" INTEGER,
    "sleep2_rapid" BOOLEAN,
    "sleep2_recoil" INTEGER,
    "sleep2_reload" TEXT,
    "exhaust1_clip" INTEGER,
    "exhaust1_rapid" BOOLEAN,
    "exhaust1_recoil" INTEGER,
    "exhaust1_reload" TEXT,
    "exhaust2_clip" INTEGER,
    "exhaust2_rapid" BOOLEAN,
    "exhaust2_recoil" INTEGER,
    "exhaust2_reload" TEXT,
    "flaming_clip" INTEGER,
    "flaming_rapid" BOOLEAN,
    "flaming_recoil" INTEGER,
    "flaming_reload" TEXT,
    "water_clip" INTEGER,
    "water_rapid" BOOLEAN,
    "water_recoil" INTEGER,
    "water_reload" TEXT,
    "freeze_clip" INTEGER,
    "freeze_rapid" BOOLEAN,
    "freeze_recoil" INTEGER,
    "freeze_reload" TEXT,
    "thunder_clip" INTEGER,
    "thunder_rapid" BOOLEAN,
    "thunder_recoil" INTEGER,
    "thunder_reload" TEXT,
    "dragon_clip" INTEGER,
    "dragon_rapid" BOOLEAN,
    "dragon_recoil" INTEGER,
    "dragon_reload" TEXT,
    "slicing_clip" INTEGER,
    "slicing_rapid" BOOLEAN,
    "slicing_recoil" INTEGER,
    "slicing_reload" TEXT,
    "wyvern_clip" INTEGER,
    "wyvern_reload" TEXT,
    "demon_clip" INTEGER,
    "demon_recoil" INTEGER,
    "demon_reload" TEXT,
    "armor_clip" INTEGER,
    "armor_recoil" INTEGER,
    "armor_reload" TEXT,
    "tranq_clip" INTEGER,
    "tranq_recoil" INTEGER,
    "tranq_reload" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "weapon_melody" (
    "id" INTEGER NOT NULL,
    "base_duration" INTEGER,
    "base_extension" INTEGER,
    "m1_duration" INTEGER,
    "m1_extension" INTEGER,
    "m2_duration" INTEGER,
    "m2_extension" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tool" (
    "id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "tool_type" TEXT,
    "duration" INTEGER,
    "duration_upgraded" INTEGER,
    "recharge" INTEGER,
    "slot_1" INTEGER,
    "slot_2" INTEGER,
    "slot_3" INTEGER,
    "icon_color" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "item_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "item_combination" (
    "id" INTEGER NOT NULL,
    "result_id" INTEGER,
    "first_id" INTEGER,
    "second_id" INTEGER,
    "quantity" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "location_text" (
    "id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "monster_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    "ecology" TEXT,
    "description" TEXT,
    "alt_state_description" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "monster_hitzone" (
    "id" INTEGER NOT NULL,
    "monster_id" INTEGER,
    "cut" INTEGER,
    "impact" INTEGER,
    "shot" INTEGER,
    "fire" INTEGER,
    "water" INTEGER,
    "ice" INTEGER,
    "thunder" INTEGER,
    "dragon" INTEGER,
    "ko" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "monster_break" (
    "id" INTEGER NOT NULL,
    "monster_id" INTEGER,
    "flinch" INTEGER,
    "wound" INTEGER,
    "sever" INTEGER,
    "extract" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "monster_reward_condition_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "skilltree_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "skill" (
    "skilltree_id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    PRIMARY KEY ("skilltree_id", "lang_id", "level")
);

CREATE TABLE IF NOT EXISTS "armorset" (
    "id" INTEGER NOT NULL,
    "rank" TEXT,
    "monster_id" INTEGER,
    "armorset_bonus_id" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "armorset_bonus_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "armorset_bonus_skill" (
    "setbonus_id" INTEGER NOT NULL,
    "skilltree_id" INTEGER NOT NULL,
    "required" INTEGER,
    PRIMARY KEY ("setbonus_id", "skilltree_id")
);

CREATE TABLE IF NOT EXISTS "weapon_melody_notes" (
    "id" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    PRIMARY KEY ("id", "notes")
);

CREATE TABLE IF NOT EXISTS "weapon_melody_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    "effect1" TEXT,
    "effect2" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "decoration" (
    "id" INTEGER NOT NULL,
    "slot" INTEGER,
    "rarity" INTEGER,
    "icon_color" TEXT,
    "skilltree_id" INTEGER NOT NULL,
    "skilltree_level" INTEGER NOT NULL,
    "skilltree2_id" INTEGER,
    "skilltree2_level" INTEGER,
    "mysterious_feystone_percent" TEXT,
    "glowing_feystone_percent" TEXT,
    "worn_feystone_percent" TEXT,
    "warped_feystone_percent" TEXT,
    "ancient_feystone_percent" TEXT,
    "carved_feystone_percent" TEXT,
    "sealed_feystone_percent" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "recipe_item" (
    "recipe_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER,
    PRIMARY KEY ("recipe_id", "item_id")
);

CREATE TABLE IF NOT EXISTS "tool_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    "name_base" TEXT,
    "description" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "location_item" (
    "id" INTEGER NOT NULL,
    "location_id" INTEGER,
    "area" INTEGER,
    "rank" TEXT,
    "item_id" INTEGER,
    "stack" INTEGER,
    "percentage" INTEGER,
    "nodes" INTEGER NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "location_camp_text" (
    "id" INTEGER NOT NULL,
    "location_id" INTEGER,
    "lang_id" TEXT,
    "name" TEXT,
    "area" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "monster_habitat" (
    "id" INTEGER NOT NULL,
    "monster_id" INTEGER,
    "location_id" INTEGER,
    "start_area" TEXT,
    "move_area" TEXT,
    "rest_area" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "monster_hitzone_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "monster_break_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "part_name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "monster_reward" (
    "id" INTEGER NOT NULL,
    "monster_id" INTEGER,
    "condition_id" INTEGER,
    "rank" TEXT,
    "item_id" INTEGER,
    "stack" INTEGER,
    "percentage" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "armorset_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "armor" (
    "id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "rarity" INTEGER,
    "rank" TEXT,
    "armor_type" TEXT,
    "armorset_id" INTEGER,
    "armorset_bonus_id" INTEGER,
    "recipe_id" INTEGER,
    "male" BOOLEAN,
    "female" BOOLEAN,
    "slot_1" INTEGER,
    "slot_2" INTEGER,
    "slot_3" INTEGER,
    "defense_base" INTEGER,
    "defense_max" INTEGER,
    "defense_augment_max" INTEGER,
    "fire" INTEGER,
    "water" INTEGER,
    "thunder" INTEGER,
    "ice" INTEGER,
    "dragon" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "weapon" (
    "id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "weapon_type" TEXT,
    "rarity" INTEGER,
    "category" TEXT,
    "previous_weapon_id" INTEGER,
    "create_recipe_id" INTEGER,
    "upgrade_recipe_id" INTEGER,
    "attack" INTEGER,
    "attack_true" INTEGER,
    "affinity" INTEGER,
    "defense" INTEGER,
    "slot_1" INTEGER,
    "slot_2" INTEGER,
    "slot_3" INTEGER,
    "element1" TEXT,
    "element1_attack" INTEGER,
    "element2" TEXT,
    "element2_attack" INTEGER,
    "element_hidden" BOOLEAN,
    "elderseal" TEXT,
    "sharpness" TEXT,
    "sharpness_maxed" BOOLEAN,
    "craftable" BOOLEAN,
    "final" BOOLEAN,
    "kinsect_bonus" TEXT,
    "phial" TEXT,
    "phial_power" INTEGER,
    "shelling" TEXT,
    "shelling_level" INTEGER,
    "notes" TEXT,
    "coating_close" INTEGER,
    "coating_power" INTEGER,
    "coating_paralysis" INTEGER,
    "coating_poison" INTEGER,
    "coating_sleep" INTEGER,
    "coating_blast" INTEGER,
    "ammo_id" INTEGER,
    "armorset_bonus_id" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "decoration_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "charm" (
    "id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "rarity" INTEGER,
    "previous_id" INTEGER,
    "recipe_id" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "kinsect" (
    "id" INTEGER NOT NULL,
    "rarity" INTEGER,
    "previous_kinsect_id" INTEGER,
    "recipe_id" INTEGER,
    "attack_type" TEXT,
    "dust_effect" TEXT,
    "power" INTEGER,
    "speed" INTEGER,
    "heal" INTEGER,
    "final" BOOLEAN,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "quest" (
    "id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "category" TEXT,
    "rank" TEXT,
    "stars" INTEGER,
    "stars_raw" INTEGER,
    "quest_type" TEXT,
    "location_id" INTEGER,
    "zenny" INTEGER,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "armor_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "armor_skill" (
    "armor_id" INTEGER NOT NULL,
    "skilltree_id" INTEGER NOT NULL,
    "level" INTEGER,
    PRIMARY KEY ("armor_id", "skilltree_id")
);

CREATE TABLE IF NOT EXISTS "weapon_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "weapon_skill" (
    "weapon_id" INTEGER NOT NULL,
    "skilltree_id" INTEGER NOT NULL,
    "level" INTEGER,
    PRIMARY KEY ("weapon_id", "skilltree_id")
);

CREATE TABLE IF NOT EXISTS "charm_skill" (
    "charm_id" INTEGER NOT NULL,
    "skilltree_id" INTEGER NOT NULL,
    "level" INTEGER,
    PRIMARY KEY ("charm_id", "skilltree_id")
);

CREATE TABLE IF NOT EXISTS "charm_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "kinsect_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "quest_text" (
    "id" INTEGER NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT,
    "objective" TEXT,
    "description" TEXT,
    PRIMARY KEY ("id", "lang_id")
);

CREATE TABLE IF NOT EXISTS "quest_monster" (
    "quest_id" INTEGER NOT NULL,
    "monster_id" INTEGER NOT NULL,
    "quantity" INTEGER,
    "is_objective" BOOLEAN,
    PRIMARY KEY ("quest_id", "monster_id")
);

CREATE TABLE IF NOT EXISTS "quest_reward" (
    "id" INTEGER NOT NULL,
    "quest_id" INTEGER,
    "group" TEXT,
    "item_id" INTEGER,
    "stack" INTEGER,
    "percentage" INTEGER,
    PRIMARY KEY ("id")
);
