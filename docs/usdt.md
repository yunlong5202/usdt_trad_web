# USDT management frontend

Based on go-admin-team/go-admin-ui, using Vue 3, TypeScript, Element Plus and Vite.
Initial upstream revision: `20cca24346f42b78a766ab3c988a415f43c55d88`.
Upstream copyright and license are retained.

## Running

Use Node 24 and the package manager pinned in `package.json`:

```sh
npx pnpm@9.15.1 install --frozen-lockfile
npx pnpm@9.15.1 dev
```

Development calls `http://localhost:8000` by default. Override `VUE_APP_BASE_API`
in `.env.development.local` for another server. Production defaults to the same
origin; `deploy/nginx.conf` forwards `/api/` and `/v1/` to the backend.

Initialize and start `usdt_trad_gin`, log in, then open **USDT 网关**. Menus come
from its migration, not hard-coded frontend routes. Assign each page's **操作**
permission to roles allowed to mutate data. CSV export also requires this grant.

## Business pages

- Wallets: filter/page, generate, import addresses, refresh balances, export, delete.
- Deposits: filter/page, create, verify transaction, retry callback, trigger scanner.
- Nodes: view/edit RPC and network configuration, invoke existing test endpoint.
- Transactions: view, confirm, retry.
- GAS: candidate lookup, create distribution, detail, sign/send, record transaction.
- Collection: candidates, network-specific settings, selected-address collection with TOTP.
- Settings: runtime parameters, reset to environment defaults.
- Notifications: configuration, Telegram bindings, test delivery, event log.
- Security: generate TOTP QR/secret, bind, unbind.

`src/api/usdt.ts` uses the shared JWT request client. `src/views/usdt/schema.ts`
declares fields and operations; `GatewayPage.vue` provides forms and ProTable
lists. Each page wrapper has the same name as its backend menu for keep-alive.
Chinese and English language packs have matching keys.

Amounts use text inputs to preserve decimal strings. BSC browser signing uses
the injected EIP-1193 wallet; no external CDN is loaded. A broadcast hash is
displayed before recording it with the API: if recording fails, use **登记交易哈希**
with that hash rather than signing again. TRON follows the existing private-key
signing flow. Private keys and bot tokens are cleared after submission and are
not stored in browser storage.

This code does not include production credentials. Real payment acceptance tests
must use the controlled environment described in the backend migration guide.

## Build and verify

```sh
npx pnpm@9.15.1 lint
npx pnpm@9.15.1 type-check
npx pnpm@9.15.1 test:unit
npx pnpm@9.15.1 build:prod
```

Publish the resulting `dist/` directory to your static server. The frontend has
no database connection and can be deployed independently from the Go server.
