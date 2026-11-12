# Fintrellis Journal

A shared editorial workspace for writing, reading, and managing short notes. Public
reading; invited members can write and edit; administrators can also delete.

## Stack

- React 19, Vite, TypeScript, React Router, TanStack Query
- React Hook Form with Zod validation, Tailwind CSS 4, Biome
- Java 25, Spring Boot 4.1, Spring Modulith, Spring Data JPA, Flyway
- PostgreSQL 18, Keycloak 26, Docker Compose
- Vitest with MSW, JUnit 5 with Testcontainers, Playwright

## Quick start

The container environment runs everything, including local Keycloak and sample
content:

```bash
docker compose up --build -d
```

Open <http://localhost:8088>. The API is on <http://localhost:8080>, Keycloak on
<http://localhost:8180>, and PostgreSQL on `localhost:55432`.

Demo accounts are imported from `infra/keycloak/journal-realm.json`:

| Username | Password        | Role          | Can do                          |
| -------- | --------------- | ------------- | ------------------------------- |
| `reader` | `reader-local`  | reader        | Read notes                      |
| `editor` | `editor-local`  | editor        | Read, create, and edit notes    |
| `admin`  | `admin-local`   | administrator | Everything, including deletion  |

These credentials are development defaults. Change them before exposing the stack.

Stop with `docker compose down`; add `-v` to discard the database and realm state.

## Local development

Requirements: Node 24+, pnpm 12+, JDK 25+, Docker.

```bash
docker compose up -d postgres keycloak
pnpm install
cp frontend/.env.example frontend/.env
cp .env.example .env

(cd backend && ./mvnw spring-boot:run)   # terminal 1, http://localhost:8080
pnpm dev                                  # terminal 2, http://localhost:5173
pnpm dev:mock                             # or: mock API, no backend or Keycloak
```

The Vite dev server proxies `/api` to Spring on port 8080. The mock mode uses MSW
and needs no database or identity provider. Its header controls switch between
signed-out, reader, editor, and administrator, plus populated, empty, service
error, and forbidden-delete scenarios.

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Flyway applies schema and sample content on start. Hibernate validates the schema
rather than altering it.

## Verification

```bash
pnpm verify          # backend, frontend, contract drift, Compose validation
pnpm test:e2e        # browser journey against the running stack
```

`pnpm verify` finds a JDK 25 through `JAVA25_HOME`, `JAVA_HOME`, or a standard
`/usr/lib/jvm` installation. The same checks run in GitHub Actions, with an
additional Playwright job that starts the Compose stack.

The current suite has 23 backend tests, 21 frontend tests, and 4 browser journeys.
The browser journeys use the real identity provider and database, not mocks.

### Test coverage

- Domain invariants and revision behaviour.
- PostgreSQL-backed CRUD, pagination, wildcard-safe search, stale-write rejection,
  validation errors, and not-found responses.
- Role enforcement at the HTTP boundary and consistent authentication errors.
- Request problem parsing, form validation, list rendering, search, empty state,
  and service failure in the browser application.
- Administrator, editor, reader, and signed-out journeys through real Keycloak.

## Structure

```text
backend/
  src/main/java/mu/uwais/fintrellis/
    posts/api contracts, application use cases, domain, persistence, web
    identity/     current actor, JWT mapping, security rules
    web/          shared problem responses and request logging
  src/main/resources/db/migration/
frontend/src/
  app/            routing, shell, theme, query client
  features/auth/  OIDC or mock session, permissions, account controls
  features/posts/ API operations, hooks, schemas, pages, components
  components/ui/  small accessible primitives
  mocks/          MSW handlers, fixtures, scenario controls
contracts/openapi.yaml
infra/            Keycloak realm and nginx configuration
tests/e2e/        Playwright journeys
```

## API

| Method | Path             | Access                          |
| ------ | ---------------- | ------------------------------- |
| GET    | `/api/posts`     | Public; `page`, `size`, `q`     |
| GET    | `/api/posts/{id}`| Public                          |
| POST   | `/api/posts`     | editor, administrator           |
| PUT    | `/api/posts/{id}`| editor, administrator           |
| DELETE | `/api/posts/{id}`| administrator                   |

`contracts/openapi.yaml` is the source for the generated frontend types. Errors use
RFC 9457 problem responses and include `fieldErrors` and a `requestId`.

## Design decisions

**Modular monolith.** Posts and identity are separate Spring Modulith modules with
explicit public boundaries. The structure is verified by an architecture test, so
it stays honest as the application grows.

**Database owns integrity.** Flyway owns the schema. Constraints mirror the domain
rules. Updates carry a version and conflicting writes receive `409` rather than
silently overwriting another editor.

**Identity is delegated.** Keycloak holds users and credentials; Spring validates
signature, issuer, expiry, and audience. The frontend hides unavailable actions,
but the API is the authority. The SPA uses authorization code with PKCE and no
client secret.

**Server state has one owner.** TanStack Query owns fetching and cache invalidation;
React Hook Form owns form state; React Router owns URL and navigation state. The
list page keeps pagination and search in the URL so views are linkable.

**Mocks use the real boundary.** MSW intercepts the same HTTP requests that Spring
serves, so mock mode exercises the production client and error handling rather than
a parallel fake service.

**Failures are part of the interface.** Validation, empty, loading, not-found,
conflict, forbidden, and service-error states each have a designed response.

## Trade-offs

- One deployable application is easier to operate than microservices and matches
  the project's scope. Module boundaries leave room to split later.
- Read access is public to keep the project focused on CRUD and permissions.
  A private journal would add a role check to the read endpoints.
- Text is plain rather than rich; this keeps the data model and validation simple.
- Optimistic concurrency is implemented, but there is no collaborative presence or
  draft autosave.
- The mock layer is a development aid, not a second backend; the Compose stack is
  the source of truth for acceptance checks.
