# Astera Data Bank

App fullstack que serve como banco de dados navegável dos dados de *Monster Hunter World* — monstros, fraquezas, hitzones, armaduras craftáveis, materiais, drops, coleta em mapa e recompensas de missão. Inspirado visualmente na UI do jogo (Astera = a cidade central onde os caçadores guardam suas informações).

---

## Stack

**Frontend** (`frontend/`)
- Vue 3 + TypeScript + Vite
- Pinia (estado global — preferência de idioma)
- TanStack Query (cache e fetch de dados, refetch automático ao trocar idioma)
- Tailwind CSS v4 + CSS Variables (tema escuro estilo MHW)
- Vue Router 4

**Backend** (`backend/`)
- Java 21 + Spring Boot 3.5
- Spring Modulith (organização em módulos por domínio)
- Spring Data JPA + Hibernate
- PostgreSQL 16 (via Docker)
- Flyway (migrações)
- Lombok

**Dados**
- Origem: [MHWorldData](https://github.com/gatheringhallstudios/MHWorldData) (SQLite com 47 tabelas)
- Importação: script Python (`scripts/import_mhdata.py`) → PostgreSQL

---

## Setup local

### Pré-requisitos
- Docker Desktop rodando
- Java 21 e Maven (ou usar o `mvnw` que já está no projeto)
- Node.js 20+ e npm
- Python 3.10+ (`py` no Windows)

### 1. Banco de dados

```bash
docker compose up -d
```

Sobe um PostgreSQL na porta `5432` com banco `astera_data_bank`, user `astera`, senha `astera`.

### 2. Importar os dados do MHW

Clone o repo do MHWorldData dentro do projeto (não é versionado):

```bash
git clone https://github.com/gatheringhallstudios/MHWorldData.git mhdata
```

Rode o script de importação (com o Postgres rodando):

```bash
pip install psycopg2-binary
python scripts/import_mhdata.py
```

Resultado: **164.492 linhas** em 47 tabelas. O script é idempotente — pode rodar de novo sem duplicar dados.

### 3. Backend

```bash
cd backend
./mvnw spring-boot:run
```

Sobe em `http://localhost:8080`. Flyway aplica as migrations automaticamente.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173`. O Vite proxia `/api/*` para `http://localhost:8080`.

> **Sem backend rodando?** Crie `frontend/.env.development.local` com `VITE_USE_STATIC=true`
> para o frontend usar os JSONs estáticos pré-gerados (funcional para leitura, sem escrita).

---

## Estrutura do projeto

```
astera-data-bank/
├── docker-compose.yml
├── scripts/
│   ├── import_mhdata.py             # SQLite → PostgreSQL (one-time)
│   ├── generate-snapshot.mjs        # Snapshot monstros via API (requer backend)
│   ├── enrich-monster-summary.mjs   # Adiciona ecology/elements aos JSONs de monstros
│   ├── generate-items-snapshot.py   # Snapshot de materiais direto do SQLite
│   └── setup-claude-permissions.ps1 # Configura permissões do Claude Code
├── backend/
│   └── src/main/java/com/asteradatabank/
│       ├── monsters/          # Listagem, detalhe, drops de monstros
│       ├── armor/             # Sets craftáveis por monstro
│       └── items/             # Fontes de itens (drops + coleta + quests)
└── frontend/
    ├── public/
    │   ├── monsters/{id}.png          # Ícones dos monstros
    │   ├── items/ic_items_*_base.svg  # Ícones de materiais (SVG tintável)
    │   └── data/                      # Snapshot estático (JSONs)
    │       ├── monsters-{lang}.json
    │       ├── monsters/{id}/{lang,drops,armor}-{lang}.json
    │       ├── items-{lang}.json
    │       └── items/{id}/sources-{lang}.json
    └── src/
        ├── views/             # MonstersView, MonsterDetailView, MaterialsView
        ├── components/        # MonsterCard, MaterialCard, ItemIcon, ItemSourcesModal, ...
        ├── composables/       # useMonsters, useMonster, useItems, useItemSources, ...
        ├── stores/            # language (Pinia)
        ├── types/             # Interfaces TS espelhando os DTOs
        ├── i18n/              # ui.ts (labels), hitzoneParts.ts (partes do corpo)
        └── router/
```

---

## Módulos do backend

Organização em [Spring Modulith](https://spring.io/projects/spring-modulith): cada subpacote é um módulo independente que se comunica via foreign-keys (`monster_id`, `item_id`, etc.).

- **`monsters`** — listagem (`GET /api/monsters`) e detalhe (`GET /api/monsters/{id}`) com fraquezas, ailments, hitzones, ecologia e elementos derivados
- **`armor`** — sets craftáveis do monstro (`GET /api/monsters/{id}/armor`) com peças, skills por nível e materiais
- **`items`** — lista de materiais (`GET /api/items`) e fontes de um item (`GET /api/items/{id}/sources`): drops de monstros + coleta em mapa + recompensas de missão

---

## API

Todos os endpoints aceitam `?lang=<código>` opcional (default `en`). Suporta os 12 idiomas do MHW (`ar`, `de`, `en`, `es`, `fr`, `it`, `ja`, `ko`, `pl`, `pt`, `ru`, `zh`) e normaliza variantes (`pt-BR`, `en-US`, etc.).

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/monsters` | Lista todos os large monsters com nome, ícone, ecologia, elementos e fraquezas |
| `GET /api/monsters/{id}` | Detalhe completo: info + fraquezas + alt state + ailments + hitzones |
| `GET /api/monsters/{id}/armor` | Sets de armadura craftáveis a partir desse monstro |
| `GET /api/monsters/{id}/drops` | Drops agrupados por rank e condição |
| `GET /api/items` | Lista de todos os materiais (`category=material`) com ícone e raridade |
| `GET /api/items/{id}/sources` | Drops por monstro + coleta em mapas + recompensas de missão |

---

## Padrão para criar novos endpoints

1. **DTO** — Java record em `<modulo>/dto/`
2. **Entity** — `@Entity` mapeada para a tabela do banco
3. **Composite PK** quando a tabela tem chave composta (`id + lang_id`) — usar `@Embeddable` + `@EmbeddedId`
4. **Repository** — `JpaRepository<Entity, Id>` com `@Query` JPQL e constructor expression direta para o DTO
5. **Service** — `@Service @Transactional(readOnly = true)`, recebe `lang` e chama `LangUtil.normalize(lang)`
6. **Controller** — `@RestController @CrossOrigin("http://localhost:5173")`, expõe o endpoint
7. **Snapshot** — adicionar chamada em `generate-snapshot.mjs` ou criar script Python se não precisar do backend

---

## i18n

Os dados (nomes de monstros, missões, locais, etc.) vêm traduzidos do banco em 12 idiomas. A **UI** tem dicionários próprios:

| Arquivo | Conteúdo |
|---------|----------|
| `i18n/ui.ts` | Labels fixos: cabeçalhos, botões, colunas, filtros, condições de drop (58 strings), ecologias (8), elementos (9) |
| `i18n/hitzoneParts.ts` | Tradução das partes do corpo (Head, Tail, etc.) |

Atualmente cobre `en` e `pt`. Para adicionar idioma, estenda os dois arquivos. Idiomas não cobertos caem em inglês.

A preferência persiste em `localStorage` via Pinia. Trocar idioma dispara refetch automático em todos os composables (a `lang` é parte da `queryKey` do TanStack Query).

---

## Ícones de materiais

Ícones SVG em `frontend/public/items/ic_items_{name}_base.svg`. O componente `ItemIcon.vue` carrega o SVG, substitui `fill="#FFFFFF"` pela cor do item (`icon_color` do banco) e aplica cache em memória.

Mapeamentos especiais (`SPECIAL_FILES` em `ItemIcon.vue`):

| `iconName` no banco | Arquivo SVG |
|---------------------|-------------|
| `Jaw` | `monster_jaw` |
| `Fang` | `claw` |
| `Webbing` | `web` |
| `CharmOre` | `charm_ore` |
| `Vocuher` *(typo no DB)* | `voucher` |
| `Egg` | `question` (sem SVG próprio) |

O relatório de cobertura de ícones fica em `frontend/public/item_icon_mapping.json` (776 itens, 0 sem ícone).

---

## Banco de dados

Migrations Flyway em `backend/src/main/resources/db/migration/`:

- `V1__init.sql` — placeholder
- `V2__mhw_schema.sql` — 47 tabelas (gerado a partir do schema do `mhw.db`)
- `V3__spring_modulith.sql` — tabela `event_publication` do Modulith

Como os dados são importados pelo script Python **antes** do Flyway rodar, `application.properties` usa:

```properties
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=2
spring.jpa.hibernate.ddl-auto=validate
```

---

## Deploy em produção (snapshot estático)

Os dados do MHW são imutáveis, então em produção não precisamos do backend rodando. Geramos **snapshots estáticos** como JSONs e servimos tudo no Vercel.

### Arquivos gerados

```
frontend/public/data/
├── monsters-{lang}.json               # Lista de monstros (ecology, elements, fraquezas)
├── monsters/{id}/{lang}.json          # Detalhe do monstro
├── monsters/{id}/drops-{lang}.json    # Drops por condição
├── monsters/{id}/armor-{lang}.json    # Armaduras craftáveis
├── items-{lang}.json                  # Lista de materiais (1072 itens × 12 idiomas)
└── items/{id}/sources-{lang}.json     # Fontes: drops + coleta + quests
```

### Como gerar o snapshot

**Monstros** (requer backend rodando):
```bash
# 1. Sobe o backend
cd backend && ./mvnw spring-boot:run

# 2. Gera todos os JSONs de monstros
cd frontend && npm run snapshot

# 3. Enriquece com ecology/elements (pode rodar sem backend)
node scripts/enrich-monster-summary.mjs
```

**Materiais** (não requer backend — lê o SQLite diretamente):
```bash
py scripts/generate-items-snapshot.py
```

Commita os JSONs gerados. O `npm run build` empacota tudo para o Vercel.

### Como o frontend escolhe entre /api e /data

`frontend/src/utils/dataUrl.ts` centraliza as URLs:
- **Dev** (`PROD=false` e `VITE_USE_STATIC` não definido): `/api/...` → Vite proxia pro backend
- **Dev sem backend** (`VITE_USE_STATIC=true`): `/data/...` → usa JSONs estáticos locais
- **Prod** (`PROD=true`): `/data/...` → sempre usa JSONs estáticos

---

## Estado atual

### Implementado

| Feature | Detalhe |
|---------|---------|
| ✅ Listagem de monstros | Grid com busca por nome, filtro por elemento e por ecologia/tipo |
| ✅ Detalhe de monstro | Fraquezas elementais e de status, alt state, ailments infligidos, armadilhas |
| ✅ Hitzones | Tabela com highlight da melhor zona por tipo de dano |
| ✅ Drops do monstro | Agrupados por rank (LR/HR/MR) e fonte (corte, quebra de parte, quest reward, etc.) |
| ✅ Armaduras craftáveis | Peças por rank, defesa, resistências, slots, skills por nível, set bonus, materiais |
| ✅ Página de Materiais | 1072 materiais com ícones coloridos, busca, abas por tipo (Partes de Monstro / Minerais / Plantas / Outros) |
| ✅ Fontes de itens | Modal com drops de monstro + pontos de coleta em mapa + recompensas de missão (521 quests) |
| ✅ Ícones de itens | SVGs tintáveis por cor do banco; mapeamento completo de 44 tipos |
| ✅ Multi-idioma | 12 idiomas nos dados; UI traduzida em en/pt com ecologias e condições de drop localizadas |
| ✅ Snapshot estático | Produção sem backend (Vercel) |

### Não implementado

- HP e valores de ataque dos monstros (não existem no MHWorldData; fonte externa seria poedb.tw)
- Armas, decorações, charms, kinsects
- Filtro por fraqueza elemental na listagem de monstros
- Comparação entre monstros ou armaduras
- Itens de evento sazonal (ex: Bilhete Estrela de Inverno) — não rastreados pelo MHWorldData
