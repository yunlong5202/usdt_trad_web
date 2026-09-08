# USDT Gateway — Web console

Vue 3 + TypeScript + Element Plus frontend, based on
[go-admin-team/go-admin-ui](https://github.com/go-admin-team/go-admin-ui).
Backend: [usdt_trad_gin](https://github.com/yunlong5202/usdt_trad_gin).

```sh
npx pnpm@9.15.1 install --frozen-lockfile
npx pnpm@9.15.1 dev
```

Open http://localhost:9527 after starting the API on port 8000. Initialize the
backend database to install the USDT menu and permissions, then log in.

Nine pages cover wallets, deposits, nodes, transactions, GAS, collection, runtime
settings, notifications and TOTP. The dashboard links to available business pages.
API calls use JWT, and the frontend is independently buildable and deployable.

```sh
npx pnpm@9.15.1 lint
npx pnpm@9.15.1 type-check
npx pnpm@9.15.1 test:unit
npx pnpm@9.15.1 build:prod
```

Use `VUE_APP_BASE_API` to select the backend. Production defaults to same origin.
See [USDT frontend guide](docs/usdt.md) for behavior and signing flow;
`deploy/nginx.conf` and `Dockerfile.usdt` provide a deployment example.
The reverse proxy example expects the backend hostname `api` to resolve.

Upstream license is retained; original README is in README.upstream.md.
