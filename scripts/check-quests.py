import sqlite3
conn = sqlite3.connect(r'C:\Users\Felipe S. Oliveira\Documents\Projects\astera-data-bank\mhdata\mhw.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

# Tabelas existentes
c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in c.fetchall()]
print("=== Tabelas no SQLite ===")
for t in tables: print(f"  {t}")

# Existe algo de quest?
quest_tables = [t for t in tables if 'quest' in t.lower() or 'reward' in t.lower() or 'shop' in t.lower()]
print("\n=== Tabelas de quest/reward/shop ===")
for t in quest_tables: print(f"  {t}")

# Conta linhas
for t in quest_tables:
    c.execute(f"SELECT COUNT(*) FROM {t}")
    print(f"  {t}: {c.fetchone()[0]} linhas")

# Amostra de quest rewards
if 'quest_reward' in tables:
    print("\n=== Amostra quest_reward ===")
    c.execute("SELECT * FROM quest_reward LIMIT 5")
    cols = [d[0] for d in c.description]
    print("Colunas:", cols)
    for r in c.fetchall(): print(dict(r))

conn.close()
