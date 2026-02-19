# Solution

> **Heads up:** This solution was developed with the assistance of AI tools — specifically Claude Code and Codex CLI. I used them for code generation, debugging, refactoring, and exploring patterns. I believe AI-assisted development is the way forward and something we should embrace rather than shy away from. The architectural decisions, trade-off calls, and review still come from me — AI just makes the execution faster and more thorough.

---

## UI/UX

### Initial State

<img width="706" height="284" alt="image" src="https://github.com/user-attachments/assets/0b236e32-635b-4a04-bad5-ddd2faf2776f" />

### Final State

(home)

<img width="1995" height="781" alt="image" src="https://github.com/user-attachments/assets/2288305c-e168-459a-a8a3-be2fe5d7a89d" />

<img width="949" height="565" alt="image" src="https://github.com/user-attachments/assets/6ff14bd1-5125-4466-a837-4c3ae64ce0ae" />

(empty state)

<img width="911" height="249" alt="image" src="https://github.com/user-attachments/assets/e508471b-a96b-47ab-bbe1-0d39151a2fd5" />

(after search)

<img width="850" height="395" alt="image" src="https://github.com/user-attachments/assets/8632f238-9431-4ac1-aadc-335d1604e222" />

---

## Objectives

### Backend

- **Refactor Blocking I/O:** Replaced `fs.readFileSync`/`fs.writeFileSync` in `items.js` with async equivalents via a shared `utils/data.js` module. Also fixed the wrong `DATA_PATH` in `stats.js` and added POST input validation (name and price are required, price must be a number >= 0 etc) in routes.
  Commit: [`39a3db7`](https://github.com/ratik21/sweep-labs-challenge/commit/39a3db71a1a7fe3bc8710328e86ec94ca3480da4)

- **Performance (Stats Caching):** Added in-memory caching in `utils/stats.js` — `getStats()` returns cached result on hit, recomputes on miss. Cache is invalidated via `invalidateStats()` called after item is mutated. Also handles empty datasets (returns 0 instead of NaN).
  Commit: [`44f8c4a`](https://github.com/ratik21/sweep-labs-challenge/commit/44f8c4a)

- **Testing:** Added 19 unit tests using Jest + supertest with mocked data layer (no real file I/O). Covers happy paths, pagination edge cases, input validation, and error handling.
  Commit: [`74d1182`](https://github.com/ratik21/sweep-labs-challenge/commit/74d1182)

### Frontend

- **Memory Leak:** Replaced the dead `active` flag in `Items.js` with `AbortController` — actually cancels in-flight requests on unmount instead of just ignoring the result.
  Commit: [`f9c3b06`](https://github.com/ratik21/sweep-labs-challenge/commit/f9c3b06)

- **Pagination & Search:** Added `offset`/`limit` query params to `GET /api/items` on the backend, and built a debounced search input (300ms) with paginated navigation on the frontend. `DataContext` manages page/query/loading/error state with a `requestIdRef` guard to prevent stale responses from racing.
  Commits: [`8163611`](https://github.com/ratik21/sweep-labs-challenge/commit/8163611) (server-side), [`a5f9e50`](https://github.com/ratik21/sweep-labs-challenge/commit/a5f9e50) (UI)

- **Performance (Virtualization):** Integrated `react-window` v2 to virtualize the items list. Only visible rows are rendered in the DOM.
  Commit: [`69a4ae2`](https://github.com/ratik21/sweep-labs-challenge/commit/69a4ae2)

- **UI/UX Polish:** Added a global stylesheet with CSS custom properties, skeleton loading states, no-jitter page transitions (stale data stays visible with opacity overlay), accessibility attributes (`aria-label`, `:focus-visible`), and `toLocaleString()` price formatting.
  Commit: [`c36e7b6`](https://github.com/ratik21/sweep-labs-challenge/commit/c36e7b6)

---

## Security

- **Removal of Remote Code Execution Backdoor:** `errorHandler.js` had a `getCookie()` function that ran at startup — it decoded base64 values from `.env`, fetched code from an external URL, and executed it via `new Function.constructor()` with full access to `require`. Removed entirely.
  Commit: [`9e3288c`](https://github.com/ratik21/sweep-labs-challenge/commit/9e3288c)

- **Remove .env from Git:** The `.env` file containing secrets was tracked in git. Added it to `.gitignore`, removed it from tracking, and created a `.env.example` template with the structure but no actual values.
  Commit: [`47f9f5a`](https://github.com/ratik21/sweep-labs-challenge/commit/47f9f5a)

---

## Extra Things Done

- **Structured Error Classes:** Added an `AppError` base class with `BadRequestError` and `NotFoundError` subclasses. Route errors now flow through the global handler consistently, and unexpected 500s get logged via pino (previously they were completely silent).
  Commit: [`de8fb7b`](https://github.com/ratik21/sweep-labs-challenge/commit/de8fb7b)

- **Frontend Proxy Configuration:** `DataContext.js` was fetching from `http://localhost:3001` directly, bypassing proxy and causing CORS issues. Switched to relative URLs (`/api/items`) and added `"proxy": "http://localhost:3001"` to `package.json`. For production, you'd use an env var like `REACT_APP_API_URL` pointing to the actual server.
  Commit: [`cee2098`](https://github.com/ratik21/sweep-labs-challenge/commit/cee2098)

- **ItemDetail.js Memory Leak:** Same pattern as the Items.js bug — `ItemDetail.js` was missing `AbortController` cleanup in its `useEffect`, so navigating away while a fetch was in-flight would setState on an unmounted component. Added the same fix.
  Commit: [`e889181`](https://github.com/ratik21/sweep-labs-challenge/commit/e889181)

- **Replace Morgan with Pino:** Swapped out morgan for pino + pino-http for structured JSON logging. Custom serializers keep the output lean (no sensitive headers dumped). Logger is silent during tests.
  Commit: [`4ec776d`](https://github.com/ratik21/sweep-labs-challenge/commit/4ec776d). The logs look like this now:
  <img width="2048" height="728" alt="image" src="https://github.com/user-attachments/assets/ea76446f-8069-4d9d-a795-22154dde6be5" />

- **Cleanup Unused Packages:** Removed `morgan` (replaced by pino), removed `request` (deprecated, unused), and cleaned up the `axios` import from errorHandler (was only used by the RCE backdoor).
  Commit: [`4ec776d`](https://github.com/ratik21/sweep-labs-challenge/commit/4ec776d)

---

## Out of Scope

Things I'd do with more time but didn't fit within the assessment scope:

- **Controller Layer:** Ideally the backend would have a `controllers/` directory — routes would just wire up HTTP to controller methods, and controllers would hold the business logic. Tests would target controllers directly rather than going through the router. Keeps things cleaner as the app grows.

- **Product Images:** The item model only has name/category/price. Adding image URLs and rendering thumbnails in the list / a larger image on the detail page would make the UI feel more complete.

- **Full Test Coverage:** Frontend has no tests currently. Would add React Testing Library tests for the key components (Items, ItemDetail, DataContext). Backend stats route also doesn't have dedicated tests.

- **Database:** The backend reads/writes a JSON file on disk, which is fine for a demo but doesn't scale. A real version would use a database (Postgres, SQLite, etc.) with proper queries instead of loading everything into memory.

- **TypeScript:** The entire codebase is plain JS. TypeScript would catch a lot of bugs at compile time — especially around the data shapes flowing between backend and frontend.
