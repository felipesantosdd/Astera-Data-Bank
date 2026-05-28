import sqlite3
conn = sqlite3.connect(r'C:\Users\Felipe S. Oliveira\Documents\Projects\astera-data-bank\mhdata\mhw.db')
c = conn.cursor()

c.execute("SELECT subcategory, COUNT(*) as n FROM item WHERE category='material' GROUP BY subcategory ORDER BY n DESC")
print('=== Subcategorias de material ===')
for r in c.fetchall(): print(f'  {r[0]}: {r[1]} itens')

c.execute("SELECT i.id, it.name, i.subcategory, i.rarity, i.icon_name, i.icon_color FROM item i JOIN item_text it ON it.id=i.id AND it.lang_id='en' WHERE i.category='material' LIMIT 12")
print('\n=== Amostra materiais ===')
for r in c.fetchall(): print(f'  {r}')

c.execute("SELECT category, COUNT(*) FROM item GROUP BY category")
print('\n=== Total por categoria ===')
for r in c.fetchall(): print(f'  {r[0]}: {r[1]}')

c.execute("SELECT COUNT(*) FROM location_item li JOIN item i ON i.id=li.item_id WHERE i.category='material'")
print('\nGathering rows para materiais:', c.fetchone()[0])
conn.close()
