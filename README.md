# Astera Data Bank

App fullstack que serve como banco de dados navegável dos dados de *Monster Hunter World* — monstros, fraquezas, hitzones, armaduras craftáveis, materiais necessários, drops e locais de coleta. Inspirado visualmente na UI do jogo (Astera = a cidade central onde os caçadores guardam suas informações).

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
- Python 3.10+ com `psycopg2-binary` instalado

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

---

## Estrutura do projeto

```
astera-data-bank/
├── docker-compose.yml          # PostgreSQL
├── scripts/
│   └── import_mhdata.py        # SQLite → PostgreSQL
├── backend/
│   └── src/main/java/com/asteradatabank/
│       ├── BackendApplication.java
│       ├── LangUtil.java       # Normalização de idiomas (pt-BR → pt)
│       ├── monsters/           # Módulo: listagem + detalhe de monstros
│       │   ├── Monster.java
│       │   ├── MonsterText.java
│       │   ├── MonsterHitzone.java
│       │   ├── MonsterHitzoneText.java
│       │   ├── MonsterRepository.java
│       │   ├── MonsterService.java
│       │   ├── MonsterController.java
│       │   └── dto/
│       ├── armor/              # Módulo: sets craftáveis a partir de um monstro
│       │   ├── Armorset.java
│       │   ├── Armor.java
│       │   ├── ArmorSkill.java
│       │   ├── Skill.java
│       │   ├── RecipeItem.java
│       │   └── ...
│       └── items/              # Módulo: fontes de um item (drops + coleta)
│           ├── MonsterReward.java
│           ├── LocationItem.java
│           └── ...
└── frontend/
    └── src/
        ├── views/              # Páginas (MonstersView, MonsterDetailView)
        ├── components/         # Cards, badges, tooltips, modal
        ├── composables/        # use* — wrappers em TanStack Query
        ├── stores/             # Pinia (language store)
        ├── types/              # Interfaces TS espelhando os DTOs
        ├── i18n/               # Strings da UI + tradução de partes do corpo
        └── router/
```

---

## Módulos do backend

A organização segue [Spring Modulith](https://spring.io/projects/spring-modulith): cada subpacote de `com.asteradatabank` é um módulo independente. Não há herança ou dependência forte entre eles — comunicam-se via foreign-keys soltos (`monster_id`, `item_id`, `recipe_id`).

- **`monsters`** — listagem (`GET /api/monsters`) e detalhe (`GET /api/monsters/{id}`)
- **`armor`** — sets craftáveis do monstro (`GET /api/monsters/{id}/armor`) com peças, skills (com descrição por nível) e materiais
- **`items`** — onde encontrar um item (`GET /api/items/{id}/sources`): drops de monstros + pontos de coleta

JPQL atravessa módulos quando necessário (ex: `ItemRepository` faz JOIN com `MonsterText` do módulo `monsters`). Hibernate enxerga todas as entidades regardless do pacote.

---

## API

Todos os endpoints aceitam `?lang=<código>` opcional. Default = `en`. Suporta os 12 idiomas do MHW (`ar`, `de`, `en`, `es`, `fr`, `it`, `ja`, `ko`, `pl`, `pt`, `ru`, `zh`) e normaliza variantes (`pt-BR`, `en-US`, `zh-CN`...).

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/monsters` | Lista todos os large monsters (resumo) |
| `GET /api/monsters/{id}` | Detalhe completo: info + fraquezas + alt state + ailments + hitzones |
| `GET /api/monsters/{id}/armor` | Sets de armadura craftáveis a partir desse monstro |
| `GET /api/items/{id}/sources` | Drops por monstro + pontos de coleta em mapas |

---

## Padrão para criar novos endpoints

1. **DTO** — Java record em `<modulo>/dto/`
2. **Entity** — `@Entity` mapeada para a tabela do banco
3. **Composite PK** quando a tabela tem chave composta (geralmente `id + lang_id`) — usar `@Embeddable` + `@EmbeddedId`
4. **Repository** — `JpaRepository<Entity, Id>` com `@Query` JPQL e constructor expression direta para o DTO
5. **Service** — `@Service @Transactional(readOnly = true)`, recebe `lang` e chama `LangUtil.normalize(lang)`
6. **Controller** — `@RestController @CrossOrigin("http://localhost:5173")`, expõe o endpoint

Quando a query precisar agregar listas aninhadas (ex: armor set → peças → skills → materiais), use **múltiplas queries flat + agrupamento em memória** no service. Evita o problema de N+1 sem precisar de `JOIN FETCH` em árvore complexa. Veja `ArmorService` como referência.

---

## i18n

Os dados (nomes de monstros, descrições, skills, etc.) já vêm traduzidos do banco. A **UI** tem dicionários próprios:

- `frontend/src/i18n/ui.ts` — labels fixos (cabeçalhos, botões, colunas)
- `frontend/src/i18n/hitzoneParts.ts` — tradução das partes do corpo (o MHWorldData não traduz "Head/Tail/etc.")

Atualmente cobre `en` e `pt`. Idiomas não cobertos caem em inglês. Para adicionar um idioma, estenda os dois dicionários.

A preferência de idioma vive em `stores/language.ts` (Pinia) e persiste no `localStorage`. Composables (`useMonsters`, `useMonster`, etc.) usam `lang` como parte da `queryKey` do TanStack Query, então qualquer mudança de idioma dispara refetch automático.

---

## Banco

Migrations Flyway em `backend/src/main/resources/db/migration/`:

- `V1__init.sql` — placeholder
- `V2__mhw_schema.sql` — 47 tabelas (gerado a partir do schema do `mhw.db`)
- `V3__spring_modulith.sql` — tabela `event_publication` do Modulith

Como os dados são importados pelo script Python **antes** do Flyway rodar, `application.properties` usa:

```
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=2
spring.jpa.hibernate.ddl-auto=validate
```

Isso diz ao Flyway: "tem dado aí, considere até V2 como já aplicado". Hibernate só valida o schema, nunca altera.

---

## Ícones e assets

- Ícones dos monstros: `frontend/public/monsters/{id}.png` (servidos localmente, sem CDN)
- Ícones de elementos: `frontend/public/icons/ic_element_*.svg` + `ic_status_*.svg`

Quando um monstro não tem ícone local, o card mostra as iniciais do nome como fallback (`MonsterCard.vue`).

---

## Deploy em produção (snapshot estático)

Os dados do MHW são imutáveis (Capcom não atualiza mais), então em produção
não precisamos do backend Spring rodando. Geramos um **snapshot estático** dos
dados como arquivos JSON e servimos tudo como site estático no Vercel.

### Fluxo

```
Backend Spring rodando local
        │
        │  scripts/generate-snapshot.mjs (Node)
        │  chama /api/* para todos os monstros × idiomas
        ▼
frontend/public/data/
    ├── monsters-{lang}.json
    ├── monsters/{id}/{lang}.json
    ├── monsters/{id}/armor-{lang}.json
    ├── monsters/{id}/drops-{lang}.json
    └── items/{id}/sources-{lang}.json
        │
        │  npm run build
        ▼
   Vercel (estático)
```

### Como gerar o snapshot

1. Sobe o backend local (`./mvnw spring-boot:run`)
2. Roda o gerador:
   ```bash
   cd frontend
   npm run snapshot
   ```
3. Os JSONs ficam em `frontend/public/data/`. Commita junto com o código.
4. `npm run build` empacota tudo num diretório estático prontinho pro Vercel.

### Como o frontend escolhe entre /api e /data

`frontend/src/utils/dataUrl.ts` centraliza as URLs. Em **dev** (`import.meta.env.PROD === false`)
o helper devolve `/api/...` — o Vite proxia pro backend. Em **build/prod**, devolve
`/data/.../{lang}.json`. Todos os composables (`useMonster`, `useMonsterDrops`, etc.)
usam esse helper.

Pra adicionar uma rota nova: cria o endpoint no Spring + um método em `dataUrl.ts` +
regenera o snapshot.

---

## Estado atual

- ✅ Listagem de monstros com fraquezas
- ✅ Detalhe de monstro completo (fraquezas, alt state, ailments, hitzones)
- ✅ Armaduras craftáveis com peças, skills (descrição + por nível), materiais e set bonus
- ✅ Modal "onde encontrar" para cada material
- ✅ Multi-idioma (12 idiomas suportados, UI em en/pt)

**Não implementado ainda:**
- HP do monstro (dado não existe no MHWorldData; viria do poedb.tw)
- Armas, decorações, charms
- Quests
- Busca/filtros
- Comparação entre monstros ou armaduras
