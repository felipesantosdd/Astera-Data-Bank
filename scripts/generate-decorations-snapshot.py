"""
Gera os arquivos estaticos de decoracoes/joias a partir do SQLite local.

Gera:
  frontend/public/data/decorations-{lang}.json

Uso:
  py scripts/generate-decorations-snapshot.py
"""

import json
import pathlib
import sqlite3

DB = pathlib.Path(__file__).parent.parent / "mhdata" / "mhw.db"
OUT = pathlib.Path(__file__).parent.parent / "frontend" / "public" / "data"
LANGS = ["ar", "de", "en", "es", "fr", "it", "ja", "ko", "pl", "pt", "ru", "zh"]

FEYSTONES = [
    ("mysterious_feystone_percent", 599),
    ("glowing_feystone_percent", 600),
    ("worn_feystone_percent", 601),
    ("warped_feystone_percent", 602),
    ("ancient_feystone_percent", 1066),
    ("carved_feystone_percent", 1067),
    ("sealed_feystone_percent", 1068),
]


def number(value):
    if value is None:
        return 0.0
    return round(float(value), 5)


conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
c = conn.cursor()

OUT.mkdir(parents=True, exist_ok=True)

for lang in LANGS:
    c.execute(
        """
        SELECT
            d.id,
            COALESCE(dt.name, dten.name, '') AS name,
            d.slot,
            d.rarity,
            d.icon_color,
            d.skilltree_id,
            d.skilltree_level,
            COALESCE(st.name, sten.name, '') AS skill_name,
            COALESCE(st.description, sten.description, '') AS skill_description,
            COALESCE(sk.description, sken.description, '') AS skill_level_description,
            d.skilltree2_id,
            d.skilltree2_level,
            COALESCE(st2.name, st2en.name, '') AS skill2_name,
            COALESCE(st2.description, st2en.description, '') AS skill2_description,
            COALESCE(sk2.description, sk2en.description, '') AS skill2_level_description,
            d.mysterious_feystone_percent,
            d.glowing_feystone_percent,
            d.worn_feystone_percent,
            d.warped_feystone_percent,
            d.ancient_feystone_percent,
            d.carved_feystone_percent,
            d.sealed_feystone_percent
        FROM decoration d
        LEFT JOIN decoration_text dt ON dt.id = d.id AND dt.lang_id = ?
        LEFT JOIN decoration_text dten ON dten.id = d.id AND dten.lang_id = 'en'
        LEFT JOIN skilltree_text st ON st.id = d.skilltree_id AND st.lang_id = ?
        LEFT JOIN skilltree_text sten ON sten.id = d.skilltree_id AND sten.lang_id = 'en'
        LEFT JOIN skill sk ON sk.skilltree_id = d.skilltree_id AND sk.lang_id = ? AND sk.level = d.skilltree_level
        LEFT JOIN skill sken ON sken.skilltree_id = d.skilltree_id AND sken.lang_id = 'en' AND sken.level = d.skilltree_level
        LEFT JOIN skilltree_text st2 ON st2.id = d.skilltree2_id AND st2.lang_id = ?
        LEFT JOIN skilltree_text st2en ON st2en.id = d.skilltree2_id AND st2en.lang_id = 'en'
        LEFT JOIN skill sk2 ON sk2.skilltree_id = d.skilltree2_id AND sk2.lang_id = ? AND sk2.level = d.skilltree2_level
        LEFT JOIN skill sk2en ON sk2en.skilltree_id = d.skilltree2_id AND sk2en.lang_id = 'en' AND sk2en.level = d.skilltree2_level
        ORDER BY d.rarity DESC, d.slot DESC, name ASC
        """,
        (lang, lang, lang, lang, lang),
    )

    rows = c.fetchall()
    decorations = []

    for r in rows:
        chances = []
        for column, item_id in FEYSTONES:
            chance = number(r[column])
            if chance <= 0:
                continue
            c.execute(
                """
                SELECT COALESCE(it.name, iten.name, '') AS name
                FROM item i
                LEFT JOIN item_text it ON it.id = i.id AND it.lang_id = ?
                LEFT JOIN item_text iten ON iten.id = i.id AND iten.lang_id = 'en'
                WHERE i.id = ?
                """,
                (lang, item_id),
            )
            feystone = c.fetchone()
            chances.append(
                {
                    "itemId": item_id,
                    "name": feystone["name"] if feystone else str(item_id),
                    "chance": chance,
                }
            )

        skills = [
            {
                "id": r["skilltree_id"],
                "name": r["skill_name"],
                "level": r["skilltree_level"],
                "description": r["skill_description"],
                "levelDescription": r["skill_level_description"],
            }
        ]
        if r["skilltree2_id"] is not None:
            skills.append(
                {
                    "id": r["skilltree2_id"],
                    "name": r["skill2_name"],
                    "level": r["skilltree2_level"],
                    "description": r["skill2_description"],
                    "levelDescription": r["skill2_level_description"],
                }
            )

        decorations.append(
            {
                "id": r["id"],
                "name": r["name"],
                "slot": r["slot"],
                "rarity": r["rarity"],
                "iconColor": r["icon_color"],
                "skills": skills,
                "chances": chances,
                "bestChance": max([c["chance"] for c in chances], default=0),
            }
        )

    path = OUT / f"decorations-{lang}.json"
    path.write_text(json.dumps(decorations, ensure_ascii=False), encoding="utf-8")
    print(f"decorations-{lang}.json - {len(decorations)} decoracoes")

conn.close()
print("Pronto!")
