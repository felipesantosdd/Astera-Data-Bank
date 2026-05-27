#!/usr/bin/env python3
"""
MHWorldData — SQLite → PostgreSQL import script

Lê o arquivo mhdata/mhw.db (SQLite) e importa todos os dados
para o banco PostgreSQL do projeto Astera Data Bank.

Como usar:
    cd astera-data-bank
    python scripts/import_mhdata.py

Pré-requisitos:
    - Docker rodando (docker compose up -d)
    - pip install psycopg2-binary
"""

import sqlite3
import psycopg2
import psycopg2.extras
import os
import sys
from pathlib import Path

# ─── Configuração ────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent

SQLITE_PATH = BASE_DIR / "mhdata" / "mhw.db"

PG_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "astera_data_bank",
    "user":     "astera",
    "password": "astera",
}

# ─── Conversão de tipos SQLite → PostgreSQL ───────────────────────────────────

TYPE_MAP = {
    "INTEGER":  "INTEGER",
    "TEXT":     "TEXT",
    "REAL":     "REAL",
    "NUMERIC":  "NUMERIC",
    "BOOLEAN":  "BOOLEAN",
    "BLOB":     "BYTEA",
    "":         "TEXT",
}

def sqlite_to_pg_type(sqlite_type: str) -> str:
    """Converte tipo SQLite para PostgreSQL."""
    t = sqlite_type.upper().split("(")[0].strip()
    return TYPE_MAP.get(t, "TEXT")

# ─── Geração do DDL ──────────────────────────────────────────────────────────

def build_create_table(table_name: str, columns: list) -> str:
    """
    Gera o CREATE TABLE para PostgreSQL.
    columns: lista de (cid, name, type, notnull, default, pk_order)
    """
    col_defs = []

    for (cid, name, dtype, notnull, default, pk) in columns:
        pg_type = sqlite_to_pg_type(dtype)
        line = f'    "{name}" {pg_type}'

        if notnull:
            line += " NOT NULL"

        if default is not None:
            if pg_type == "BOOLEAN":
                line += f" DEFAULT {'TRUE' if str(default) == '1' else 'FALSE'}"
            else:
                line += f" DEFAULT {default}"

        col_defs.append(line)

    # Primary key (pode ser composta)
    pk_cols = [col[1] for col in columns if col[5] > 0]
    if pk_cols:
        pk_names = ", ".join(f'"{c}"' for c in pk_cols)
        col_defs.append(f"    PRIMARY KEY ({pk_names})")

    body = ",\n".join(col_defs)
    return f'CREATE TABLE IF NOT EXISTS "{table_name}" (\n{body}\n);'

# ─── Conversão de valores ────────────────────────────────────────────────────

def convert_row(row: tuple, col_types: list[str]) -> tuple:
    """
    Converte uma linha do SQLite para tipos Python compatíveis com psycopg2.
    Especialmente importante para BOOLEAN (SQLite guarda 0/1).
    """
    result = []
    for value, pg_type in zip(row, col_types):
        if value is None:
            result.append(None)
        elif pg_type == "BOOLEAN":
            result.append(bool(value))
        else:
            result.append(value)
    return tuple(result)

# ─── Import principal ────────────────────────────────────────────────────────

def get_all_tables(sqlite_cur) -> list[str]:
    """Retorna todas as tabelas do SQLite em ordem de criação."""
    sqlite_cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid"
    )
    return [row[0] for row in sqlite_cur.fetchall()]


def import_table(sqlite_cur, pg_cur, table_name: str) -> int:
    """
    Importa uma tabela inteira do SQLite para o PostgreSQL.
    Retorna o número de linhas inseridas.
    """
    # Schema da tabela
    sqlite_cur.execute(f'PRAGMA table_info("{table_name}")')
    columns = sqlite_cur.fetchall()

    if not columns:
        print(f"  [SKIP] {table_name}: sem colunas, pulando")
        return 0

    col_names  = [col[1] for col in columns]
    col_types  = [sqlite_to_pg_type(col[2]) for col in columns]

    # Cria a tabela se não existir
    ddl = build_create_table(table_name, columns)
    pg_cur.execute(ddl)

    # Verifica se já tem dados
    pg_cur.execute(f'SELECT COUNT(*) FROM "{table_name}"')
    existing = pg_cur.fetchone()[0]
    if existing > 0:
        print(f"  [SKIP] {table_name}: ja tem {existing} linhas, pulando")
        return 0

    # Busca todos os dados do SQLite
    sqlite_cur.execute(f'SELECT * FROM "{table_name}"')
    rows = sqlite_cur.fetchall()

    if not rows:
        print(f"  [VAZIA] {table_name}")
        return 0

    # Monta o INSERT
    placeholders = ", ".join(["%s"] * len(col_names))
    col_list     = ", ".join(f'"{c}"' for c in col_names)
    insert_sql   = f'INSERT INTO "{table_name}" ({col_list}) VALUES ({placeholders})'

    # Converte e insere em batch
    converted_rows = [convert_row(row, col_types) for row in rows]
    psycopg2.extras.execute_batch(pg_cur, insert_sql, converted_rows, page_size=500)

    return len(rows)


def main():
    print("=" * 60)
    print("  MHWorldData -> PostgreSQL Import")
    print("=" * 60)

    # Verifica o arquivo SQLite
    if not SQLITE_PATH.exists():
        print(f"\n[ERRO] Arquivo nao encontrado: {SQLITE_PATH}")
        print("   Execute primeiro: baixe mhw.db em mhdata/")
        sys.exit(1)

    # Conecta ao SQLite
    print(f"\n[SQLite]     {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(str(SQLITE_PATH))
    sqlite_cur  = sqlite_conn.cursor()

    # Conecta ao PostgreSQL
    print(f"[PostgreSQL] {PG_CONFIG['host']}:{PG_CONFIG['port']}/{PG_CONFIG['dbname']}")
    try:
        pg_conn = psycopg2.connect(**PG_CONFIG)
        pg_conn.autocommit = False
        pg_cur  = pg_conn.cursor()
    except psycopg2.OperationalError as e:
        print(f"\n[ERRO] Falha ao conectar no PostgreSQL: {e}")
        print("   Verifique se o Docker esta rodando: docker compose up -d")
        sys.exit(1)

    # Importa todas as tabelas
    tables = get_all_tables(sqlite_cur)
    print(f"\n{len(tables)} tabelas encontradas\n")

    total_rows = 0
    try:
        for table in tables:
            count = import_table(sqlite_cur, pg_cur, table)
            if count > 0:
                print(f"  [OK] {table:<45} {count:>6} linhas")
            total_rows += count

        pg_conn.commit()
        print(f"\n[CONCLUIDO] {total_rows} linhas inseridas no total.")

    except Exception as e:
        pg_conn.rollback()
        print(f"\n[ERRO] Falha durante o import: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        sqlite_conn.close()
        pg_cur.close()
        pg_conn.close()


if __name__ == "__main__":
    main()
