# bun-github-lang-searcher

A Bun.js HTTP server that fetches a GitHub user's repositories via the GitHub API, aggregates programming language usage, and returns either an SVG donut chart or raw JSON data.

## How it works

1. On first request for a GitHub user, all their public repos are fetched and language usage data is stored in a local SQLite database.
2. Cached data is reused for 7 days before being refreshed from the API.
3. Language usage is aggregated across all repos and rendered as an SVG sector chart using an EJS template, or returned as JSON.

## Routes

| Route | Response | Description |
|---|---|---|
| `GET /:github_user` | `image/svg+xml` | Donut chart of language usage |
| `GET /:github_user/json` | `application/json` | Raw repo + language data |

### Query parameters

Both routes accept an optional `tags` parameter to filter languages by category:

| Tag | Languages |
|---|---|
| `programing-language` | JavaScript, TypeScript, Python, Go, Rust, C, C++, C#, Java, Ruby, PHP, Lua |
| `frontend-framework` | Svelte |
| `config-language` | Makefile |
| `data-language` | HTML, CSS |

**Example:**
```
GET /torvalds?tags=programing-language,frontend-framework
```

## Stack

- **Runtime**: [Bun](https://bun.sh)
- **Database**: SQLite via `bun:sqlite`
- **Templating**: [EJS](https://ejs.co) (SVG generation)
- **API**: GitHub REST API (`/users/:user/repos`, `/repos/:owner/:repo/languages`)

## Database schema

```
owner          — GitHub users fetched (with last_updated_at for cache invalidation)
repo           — repositories belonging to an owner
language_usage — bytes of each language per repo (from GitHub API)
language_data  — language metadata: display color and tag category
```

The view `get_languages_by_owner` joins these tables and aggregates usage per language per owner.

## Setup

```bash
# Install dependencies
bun install

# Initialize the database
bun run sqlite3 purple.sqlite3 < database.sql

# Start the server
bun run index.ts
```

The server starts at `http://localhost:3000` by default.

## Environment variables

See `.env.example`. Currently unused in the main entrypoint (reserved for a potential Turso/libSQL migration).

```env
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```
