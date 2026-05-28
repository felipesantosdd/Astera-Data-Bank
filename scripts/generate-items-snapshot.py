"""
Gera os arquivos estáticos de itens/materiais a partir do SQLite local.
Não precisa do backend rodando.

Gera:
  frontend/public/data/items-{lang}.json        — lista de materiais por idioma
  frontend/public/data/items/{id}/sources-{lang}.json — fontes (drops + coleta + quests)

Uso:
  py scripts/generate-items-snapshot.py
"""

import sqlite3, json, pathlib

DB    = pathlib.Path(__file__).parent.parent / "mhdata" / "mhw.db"
OUT   = pathlib.Path(__file__).parent.parent / "frontend" / "public" / "data"
LANGS = ["ar","de","en","es","fr","it","ja","ko","pl","pt","ru","zh"]

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
c = conn.cursor()

# ── 1. Lista de materiais por idioma ─────────────────────────────────────────
print("Gerando listas de materiais...")
for lang in LANGS:
    c.execute("""
        SELECT i.id, it.name, i.rarity, i.icon_name, i.icon_color, i.category, i.subcategory
        FROM item i
        JOIN item_text it ON it.id = i.id AND it.lang_id = ?
        WHERE i.category = 'material'
        ORDER BY i.id ASC
    """, (lang,))
    rows = c.fetchall()
    items = [
        {
            "id":          r["id"],
            "name":        r["name"] or "",
            "rarity":      r["rarity"],
            "iconName":    r["icon_name"],
            "iconColor":   r["icon_color"],
            "category":    r["category"],
            "subcategory": r["subcategory"],
        }
        for r in rows
    ]
    path = OUT / f"items-{lang}.json"
    path.write_text(json.dumps(items, ensure_ascii=False), encoding="utf-8")
    print(f"  items-{lang}.json — {len(items)} materiais")

# ── 2. Sources de cada item (drops + coleta + quests) ────────────────────────
c.execute("SELECT id FROM item WHERE category = 'material'")
all_ids = [r["id"] for r in c.fetchall()]

print(f"\nAtualizando sources de {len(all_ids)} materiais...")
done = 0

for item_id in all_ids:
    for lang in LANGS:
        # Monster rewards
        c.execute("""
            SELECT mt.name AS monster_name, mr.rank, ct.name AS condition,
                   mr.stack, mr.percentage, m.id AS monster_id
            FROM monster_reward mr
            JOIN monster_text mt ON mt.id = mr.monster_id AND mt.lang_id = ?
            JOIN monster_reward_condition_text ct
                ON ct.id = mr.condition_id AND ct.lang_id = ?
            JOIN monster m ON m.id = mr.monster_id
            WHERE mr.item_id = ?
            ORDER BY mr.percentage DESC
        """, (lang, lang, item_id))
        rewards = [
            {
                "monsterId":   r["monster_id"],
                "monsterName": r["monster_name"],
                "rank":        r["rank"],
                "condition":   r["condition"],
                "stack":       r["stack"],
                "percentage":  r["percentage"],
            }
            for r in c.fetchall()
        ]

        # Gathering locations
        c.execute("""
            SELECT lt.name AS location_name, li.location_id, li.area,
                   li.rank, li.stack, li.percentage, li.nodes
            FROM location_item li
            JOIN location_text lt ON lt.id = li.location_id AND lt.lang_id = ?
            WHERE li.item_id = ?
            ORDER BY li.percentage DESC
        """, (lang, item_id))
        gathering = [
            {
                "locationId":   r["location_id"],
                "locationName": r["location_name"],
                "area":         r["area"],
                "rank":         r["rank"],
                "stack":        r["stack"],
                "percentage":   r["percentage"],
                "nodes":        r["nodes"],
            }
            for r in c.fetchall()
        ]

        # Quest rewards
        c.execute("""
            SELECT q.id AS quest_id, qt.name AS quest_name, q.category,
                   q.rank, q.stars, qr."group" AS reward_group,
                   qr.stack, qr.percentage
            FROM quest_reward qr
            JOIN quest q ON q.id = qr.quest_id
            JOIN quest_text qt ON qt.id = q.id AND qt.lang_id = ?
            WHERE qr.item_id = ?
            ORDER BY q.rank ASC, q.stars ASC, qr.percentage DESC
        """, (lang, item_id))
        quests = [
            {
                "questId":     r["quest_id"],
                "questName":   r["quest_name"],
                "category":    r["category"],
                "rank":        r["rank"],
                "stars":       r["stars"],
                "rewardGroup": r["reward_group"],
                "stack":       r["stack"],
                "percentage":  r["percentage"],
            }
            for r in c.fetchall()
        ]

        sources = {"rewards": rewards, "gathering": gathering, "quests": quests}
        path = OUT / "items" / str(item_id) / f"sources-{lang}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(sources, ensure_ascii=False), encoding="utf-8")

    done += 1
    if done % 100 == 0 or done == len(all_ids):
        print(f"  {done}/{len(all_ids)}")

conn.close()
print("\nPronto!")
