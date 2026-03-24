# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GestorProcessosRamajo** is a fullstack industrial process management system for tracking manufacturing orders (Processos) through processing stations (Traves) and treatment types (Banhos).

- **Frontend:** `Ramajo/` — React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend:** `gestorProc/` — Spring Boot 3 + Java 21 + MySQL via JPA/Hibernate
- **API Base URL (dev):** `http://localhost:8080/api`
- **API Base URL (`shared.ts` current):** `http://129.148.62.223:8080/api` — points to a remote server; change to `localhost` for local dev
- **Frontend Dev Port:** `5174` (configured in CorsConfig)
- **Docker Compose:** `docker-compose.yaml` at repo root spins up MySQL + Spring Boot API (:8080) + Frontend via Nginx (:80)

---

## Commands

### Frontend (`Ramajo/`)
```bash
npm run dev       # Start Vite dev server on :5174
npm run build     # tsc -b + vite build (TypeScript check + bundle)
npm run lint      # ESLint check
npm run preview   # Preview production build
```

### Backend (`gestorProc/`)
```bash
./mvnw spring-boot:run          # Run Spring Boot app on :8080
./mvnw test                     # Run all tests
./mvnw test -Dtest=ClassName    # Run a single test class
./mvnw package                  # Build JAR
```

### Database
- MySQL must be running on `localhost:3306`
- Set `spring.datasource.url` in `application.properties` to your database name
- Default credentials: `dev` / `1234567`
- Hibernate `ddl-auto=update` auto-creates/updates tables from JPA entities

---

## Architecture

### Backend Domain Model

Four JPA entities in `gestorProc/src/main/java/com/ramajo/gestorProc/`:

- **Processo** — Manufacturing order (`numOS`, `createdAt`, `finishedAt`). Has `@OneToMany` to `TraveBanho` via `historicoBanhos`.
- **Trave** — Processing station (`nome`, `emUso` in-use flag).
- **Banho** — Treatment bath type (`nome`, `descricao`, `tempoBanho`, `estagio: Estagio`).
- **TraveBanho** — Central junction entity. Has two conceptually distinct record types:
  - **Root link** (`banho = null`): Created once when a trave joins a processo. Carries `estagioAguardando` (nullable `Estagio` enum) to track which stage the trave is waiting in between active sessions.
  - **Session record** (`banho != null`): Created each time a trave enters a banho. Has `iniciadoEm` (always set on creation) and `finishedAt` (null while active).

The `Estagio` enum: `PRE_TRATAMENTO` → `TRATAMENTO` → `POS_TRATAMENTO`.

#### TraveBanho `estagioAguardando` lifecycle

| Value | Meaning |
|-------|---------|
| `null` | Trave in PRE_TRATAMENTO (initial state) or currently in an active banho session |
| `TRATAMENTO` | Trave finished PRE_TRATAMENTO, waiting to be placed in a TRATAMENTO banho |
| `POS_TRATAMENTO` | Trave finished TRATAMENTO, waiting for processo finalization |

When a session ends via `PUT /trave_banho/{id}/avancar-estagio`, the root link's `estagioAguardando` is set to the next stage. When a new session starts via `POST /trave_banho`, the root link's `estagioAguardando` is cleared back to `null`.

### Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/processo/ativo` | Active processes (`finishedAt` is null) |
| GET | `/api/processo/inativo` | Completed processes |
| POST | `/api/processo` | Create process, creates root links for each trave |
| PUT | `/api/processo/finalizar/{id}` | Complete process, close open sessions, free traves |
| GET | `/api/processo/{id}/traves` | Current state of each trave (calls `TraveEstadoDTO`) |
| GET | `/api/processo/{id}/historico` | Full banho session history for a processo |
| POST | `/api/processo/{id}/trave` | Add a trave to an existing active processo |
| GET | `/api/trave/disponiveis` | Available traves (`emUso = false`) |
| POST | `/api/trave_banho` | Start a banho session; clears `estagioAguardando` on root link |
| PUT | `/api/trave_banho/finalizar/{id}` | Finish a banho session (same stage moves) |
| PUT | `/api/trave_banho/{id}/avancar-estagio` | Finish session + set `estagioAguardando` on root link |

Swagger UI: `http://localhost:8080/swagger-ui.html` (springdoc-openapi).

### Frontend Architecture

**Routing** (`main.tsx`): React Router v6 with three routes under `App` layout shell:
- `/` → `ProcessosPage`
- `/cadastros` → `CadastrosPage`
- `/registros` → `RegistrosPage`

**`App.tsx`** — Layout only: navbar with NavLink tabs, renders `<Outlet />`.

**`shared.ts`** — Single source for all TypeScript types (`TraveEstado`, `TraveEmBanho`, `Banho`, `Processo`, `Estagio`, `TraveBanhoHistorico`, etc.), the Axios instance (`api`), and shared utility functions: `formatarTempo(minutes)`, `calcularProgressoBanho(iniciadoEm, tempoBanhoMinutos)`, `formatarTempoDecorrido(iniciadoEm)`.

**`ProcessosPage.tsx`** — Main operational view. Three-tab stepper (PRE_TRATAMENTO / TRATAMENTO / POS_TRATAMENTO):
- **PRE_TRATAMENTO / TRATAMENTO:** Amber strip showing traves with `estagioAguardando` matching the active tab + BanhoCards for active sessions. Modal "Iniciar tratamento" to start sessions; modal "Mover traves" to move within-stage or advance to next stage.
- **POS_TRATAMENTO:** `ProcessoPosCard` per processo. Button enabled only when ALL traves of that processo have `estagioAguardando = 'POS_TRATAMENTO'`.
- `carregarTudo()` fetches `/processo/ativo` then calls `/processo/{id}/traves` for each active processo in parallel. Builds `travesPorBanho` (active sessions by banhoId), `travesAguardando` (root links with non-null `estagioAguardando`), and `processosPos` (processes with at least one POS_TRATAMENTO trave).

**`CadastrosPage.tsx`** — CRUD for Traves and Banhos.

**`RegistrosPage.tsx`** — Read-only view of completed processes (`/processo/inativo`). Each process card is expandable; banho session history (`/processo/{id}/historico`) is lazy-loaded on first expand and cached in component state.

**`components/Modal.tsx`** — Reusable modal accepting `title`, `description`, `footer`, `variant`, and `wide` props.
