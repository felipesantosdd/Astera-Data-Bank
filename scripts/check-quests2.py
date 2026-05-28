import sqlite3
conn = sqlite3.connect(r'C:\Users\Felipe S. Oliveira\Documents\Projects\astera-data-bank\mhdata\mhw.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

# Estrutura da tabela quest
c.execute("SELECT * FROM quest LIMIT 3")
cols = [d[0] for d in c.description]
print("=== quest colunas ===", cols)
for r in c.fetchall(): print(dict(r))

# Amostra com quest_text
print("\n=== quest com nome (pt) ===")
c.execute("""
    SELECT q.id, q.category, q.stars, q.quest_type, qt.name, qt.objective
    FROM quest q
    JOIN quest_text qt ON qt.id = q.id AND qt.lang_id = 'pt'
    LIMIT 10
""")
for r in c.fetchall(): print(dict(r))

# Exemplo: Winter Star Ticket = item 541 (Bilhete Estrela de Inverno?)
# Vamos encontrar itens sem drops mas com quest rewards
print("\n=== Quantos itens tem quest_reward mas nao tem monster_reward? ===")
c.execute("""
    SELECT COUNT(DISTINCT qr.item_id)
    FROM quest_reward qr
    WHERE qr.item_id NOT IN (SELECT DISTINCT item_id FROM monster_reward)
""")
print("Itens SÓ em quest rewards:", c.fetchone()[0])

# Busca o Bilhete Estrela de Inverno
print("\n=== Bilhete Estrela de Inverno ===")
c.execute("SELECT i.id, it.name FROM item i JOIN item_text it ON it.id=i.id AND it.lang_id='pt' WHERE it.name LIKE '%Estrela%' OR it.name LIKE '%Inverno%'")
for r in c.fetchall(): print(dict(r))

# Amostra de quest rewards para um item
c.execute("""
    SELECT q.id, qt.name AS quest_name, q.stars, q.category, qr.group, qr.stack, qr.percentage
    FROM quest_reward qr
    JOIN quest q ON q.id = qr.quest_id
    JOIN quest_text qt ON qt.id = q.id AND qt.lang_id = 'pt'
    WHERE qr.item_id = 543
    LIMIT 10
""")
print("\n=== Quest rewards para item 543 ===")
for r in c.fetchall(): print(dict(r))

conn.close()
