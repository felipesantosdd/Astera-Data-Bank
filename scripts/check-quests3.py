import sqlite3
conn = sqlite3.connect(r'C:\Users\Felipe S. Oliveira\Documents\Projects\astera-data-bank\mhdata\mhw.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

# Bilhete Estrela de Inverno = id 513
c.execute("""
    SELECT q.id, qt.name AS quest_name, q.stars, q.category, q.rank,
           qr."group", qr.stack, qr.percentage
    FROM quest_reward qr
    JOIN quest q ON q.id = qr.quest_id
    JOIN quest_text qt ON qt.id = q.id AND qt.lang_id = 'pt'
    WHERE qr.item_id = 513
""")
print("=== Quest rewards - Bilhete Estrela de Inverno (513) ===")
for r in c.fetchall(): print(dict(r))

# Categorias de quest
c.execute("SELECT DISTINCT category, rank, quest_type FROM quest ORDER BY category, rank")
print("\n=== Categorias de quest ===")
for r in c.fetchall(): print(dict(r))

# Grupos de reward
c.execute('SELECT DISTINCT "group" FROM quest_reward')
print("\n=== Grupos de reward ===", [r[0] for r in c.fetchall()])

# Total de itens material com quest rewards
c.execute("""
    SELECT COUNT(DISTINCT qr.item_id)
    FROM quest_reward qr
    JOIN item i ON i.id = qr.item_id
    WHERE i.category = 'material'
""")
print("\nMateriais com quest rewards:", c.fetchone()[0])

conn.close()
