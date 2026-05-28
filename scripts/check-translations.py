import sqlite3
conn = sqlite3.connect(r'C:\Users\Felipe S. Oliveira\Documents\Projects\astera-data-bank\mhdata\mhw.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

# 1. Condicoes de reward em pt vs en
print("=== Condicoes de reward (en vs pt) ===")
c.execute("""
    SELECT ce.name as en, cp.name as pt
    FROM monster_reward_condition_text ce
    LEFT JOIN monster_reward_condition_text cp ON cp.id = ce.id AND cp.lang_id = 'pt'
    WHERE ce.lang_id = 'en'
    LIMIT 20
""")
for r in c.fetchall():
    print(f"  EN: {r['en']:<30} | PT: {r['pt']}")

# 2. Location texts em pt
print("\n=== Location names (en vs pt) ===")
c.execute("""
    SELECT le.name as en, lp.name as pt
    FROM location_text le
    LEFT JOIN location_text lp ON lp.id = le.id AND lp.lang_id = 'pt'
    WHERE le.lang_id = 'en'
    LIMIT 15
""")
for r in c.fetchall():
    print(f"  EN: {r['en']:<30} | PT: {r['pt']}")

# 3. Itens sem iconName ou com iconName incomum
print("\n=== Materiais sem iconName ===")
c.execute("""
    SELECT i.id, it.name, i.icon_name, i.icon_color
    FROM item i
    JOIN item_text it ON it.id = i.id AND it.lang_id = 'pt'
    WHERE i.category = 'material' AND (i.icon_name IS NULL OR i.icon_name = '')
    LIMIT 10
""")
for r in c.fetchall():
    print(f"  id={r['id']} {r['name']} icon={r['icon_name']}")

# 4. Itens com 'Asa' no nome
print("\n=== Itens com 'Asa' no nome (pt) ===")
c.execute("""
    SELECT i.id, it.name, i.icon_name, i.icon_color
    FROM item i
    JOIN item_text it ON it.id = i.id AND it.lang_id = 'pt'
    WHERE i.category = 'material' AND it.name LIKE '%Asa%'
    LIMIT 15
""")
for r in c.fetchall():
    print(f"  id={r['id']} {r['name']:<40} icon={r['icon_name']}")

# 5. Todos os iconNames distintos nos materiais
print("\n=== iconNames distintos em materiais ===")
c.execute("SELECT DISTINCT icon_name FROM item WHERE category='material' ORDER BY icon_name")
print(" ", [r[0] for r in c.fetchall()])

conn.close()
