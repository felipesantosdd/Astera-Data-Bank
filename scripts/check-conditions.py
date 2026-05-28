import sqlite3
conn = sqlite3.connect(r'C:\Users\Felipe S. Oliveira\Documents\Projects\astera-data-bank\mhdata\mhw.db')
c = conn.cursor()
c.execute("SELECT DISTINCT name FROM monster_reward_condition_text WHERE lang_id='en' ORDER BY name")
for r in c.fetchall(): print(r[0])
conn.close()
