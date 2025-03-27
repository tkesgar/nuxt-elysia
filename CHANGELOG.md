# 0.2.0 (2025-03-27)

- New options:
  - `fixBunPlainTextResponse`: fix handlers returning string as response has
    `Content-Type: application/octet-stream` header instead of `text/plain`
    (inconsistent with Elysia app)
  - `treatyRequestHeaders`: pass request headers to Elysia app
- Bugfixes:
  - Fix treaty config typing in Nuxt app config
- Update package information:
  - Documentation (README)
  - License information
  - Benchmark result
- Add tests

# 0.1.2 (2025-03-24)

- Add missing imports in the generated server plugin

# 0.1.1 (2025-03-22)

- Fix missing runtime bundle
- Remove `@elysia/node` peer dependency

# 0.1.0 (2025-03-21)

Initial version
