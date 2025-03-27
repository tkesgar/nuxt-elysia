# nuxt-elysia

> Use Elysia app in Nuxt

## Features

- **Directly mount Elysia in Nuxt**
  - Simplify development setup (you do not have to run Elysia app server
    separately)
  - Simplify deployment (deploy only one server instead of two servers)
- **Eden Treaty integration**
  - Full Eden Treaty features (end-to-end type safety, lightweight size)
  - **Isomorphic client**: Eden Treaty works in both server-side and client-
    side without additional configuration
- **Works in both Node.js and Bun**
  - Run in Bun for maximum performance
  - Run in Node.js for better compatibility with some packages (while waiting
    for full Node.js compatibility from Bun)

## Setup

Requirements: **Node v20+** or **Bun v1**

Install the package:

```
# Bun
bun add nuxt-elysia -D
bun add elysia @elysiajs/eden

# NPM
npm install nuxt-elysia --save-dev
npm install elysia @elysiajs/eden
```

> See [Running in Bun][#running-the-application-in-bun] below on how to run Nuxt
> applications in Bun instead of Node.js.

> `nuxt-elysia` declares `elysia` and `@elysiajs/eden` as peer dependency, which
> will be automatically installed by most package managers (Bun, NPM, PNPM).
> However, by explicitly declaring the peer dependency you will be able to
> control the specific Elysia and Eden Treaty version to use.

> `nuxt-elysia` should be only installed as `devDependency`, since it is only
> necessary during development and build. It is not needed in production
> environment.

Add to modules list in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    // ...
	'nuxt-elysia'
  ]
})
```

Create `api.ts` in the project root:

```ts
export default () => new Elysia()
  .get('/hello', () => ({ message: 'Hello world!' })
```

Use in Vue app:

```vue
<template>
  <div>
    <p>{{ helloMessage }}</p>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()

const { data: helloMessage } = await useAsyncData(async () => {
  const { data, error } = await $api.hello.get()
  
  if (error) {
    throw new Error('Unknown error')
  }
  
  return data.message
})
</script>
```

## Module options

<!-- Copy from ModuleOptions in src/module.ts -->
```ts
export interface ModuleOptions {
  /**
   * Specifies the module that exports the Elysia app factory function.
   *
   * The default value `~~/api` is a Nuxt default alias for `/api` path in
   * the Nuxt project root. This alias may resolve to `<root>/api.ts` or
   * `<root>/api/index.ts`.
   *
   * Default: `~~/api`
   */
  module: string
  /**
   * Specifies the path to mount the Elysia app.
   *
   * Set to empty string (`''`) to disable mounting the Elysia app.
   *
   * Default: `/_api`
   */
  path: string
  /**
   * Whether to enable Eden Treaty plugin.
   *
   * Default: `true`
   */
  treaty: boolean
}
```

## Notes

### Known quirks

Because nuxt-elysia mounts Elysia as a handler for H3 application instead of
directly handling the HTTP request, there may be several quirks that we need to
fix with additional wrappers and transforms. You can check `server-plugin.ts`
generated from `server-plugin.template` for the list of currently implemented
workarounds:

Our goal is to ensure the same results between mounting the Elysia app and
running the Elysia app as separate server (directly in Bun or running in Node.js
via `@elysiajs/node` adapter).

### `module` option

You can use any aliases from Nuxt in `module` option.

The default value for `module` is `~~/api`, which is a Nuxt default alias
for `<root>/api` path in the Nuxt project root. The path may resolve to
`<root>/api.ts` or `<root>/api/index.ts`.

Other paths you can use:

```ts
export default defineNuxtConfig({
  nuxtElysia: {
    // Custom alias
    module: '#api',
    // Module in other package
    module: '@my-org/my-package',
    // Absolute path
    module: '/absolute/path/to/module',
    // Generated module (from other Nuxt module)
    module: '~~/.nuxt/my-generated-module',
  }
})
```

### Only mount in development

```ts
export default defineNuxtConfig({
  nuxtElysia: {
    module: '@my-org/my-server-app',
    path: import.meta.dev ? '/_api' : ''
  }
})
```

This is useful if you only want to mount the Elysia app in development setup
and uses a reverse proxy to serve the app in separate instance. For example,
using Nginx:

```
location / {
  proxy_pass http://my-nuxt-app;
}

location /_api {
  proxy_pass http://my-api-service;
}
```

### Running the application in Bun

The Elysia app is mounted as request handler for the Nitro application stack,
so you can use Nuxt Elysia without Bun.

If you want to use Bun-specific APIs (`Bun.*`), you will need to run Nuxt using
Bun. Bun [respects node shebang][bun-bun-flag], meaning that `nuxt dev` actually
uses Node.js (if both Node.js and Bun are available). Therefore, you need to add
`--bun` flag to override this behavior:

```json
{
  "scripts": {
    "dev": "bun --bun dev",
    "build": "bun --bun build",
    "preview": "bun --bun preview"
  }
}
```

However, if you do this you will also need to use [Nitro Bun preset][nitro-bun-preset]
to build the app. This is because the default `node-server` preset will fail to
bundle Elysia, since Elysia has Bun-specific exports that will not be handled
properly by the default preset:

```json
{
  "exports": {
		".": {
			"types": "./dist/index.d.ts",
			"bun": "./dist/bun/index.js",
			"import": "./dist/index.mjs",
			"require": "./dist/cjs/index.js"
		}
  }
}
```

Furthermore, you will also need to include the root `node_modules` in your
deployment, as opposed to only `.output` directory. This is because the
Bun-specific packages will be read from the root directory:

```
<root>
├── .output
├── node_modules
├── package.json
└── bun.lock
```

If you use Docker to containerize your app, you can use this Dockerfile as
reference:

```Dockerfile
# Use Bun base image
FROM oven/bun:1-slim

# Set working directory
WORKDIR /app

# Set NODE_ENV=production (prevents development-specific logs from some
# packages such as vue-router)
ENV NODE_ENV=production

# Copy .output directory generated by Nuxt
# Make sure to run `nuxt build` before building the container image
COPY .output .output

# Copy package.json and bun.lock, then run `bun install --production`
# to install only production dependencies.
COPY package.json bun.lock ./
RUN bun install --production

# Set working user
USER bun

# Expose port 3000 (default Nitro port)
EXPOSE 3000

# Set image entrypoint (run the generated server module using Bun)
ENTRYPOINT [ "bun", "./.output/server/index.mjs" ]
```

[bun-bun-flag]: https://bun.sh/docs/cli/run#bun
[nitro-bun-preset]: https://nitro.build/deploy/runtimes/bun

### Benchmark

The benchmark Nuxt app is available in `test/fixtures/benchmark`.

We run the tests using `bombardier` on the following machine:

```
                          ./+o+-       tkesgar@tkesgar-ideapad
                  yyyyy- -yyyyyy+      OS: Ubuntu 24.04 noble(on the Windows Subsystem for Linux)
               ://+//////-yyyyyyo      Kernel: x86_64 Linux 5.15.167.4-microsoft-standard-WSL2
           .++ .:/++++++/-.+sss/`      Uptime: 1h 16m
         .:++o:  /++++++++/:--:/-      Packages: 581
        o:+o+:++.`..```.-/oo+++++/     Shell: bash 5.2.21
       .:+o:+o/.          `+sssoo+/    Resolution: No X Server
  .++/+:+oo+o:`             /sssooo.   WM: Not Found
 /+++//+:`oo+o               /::--:.   GTK Theme: Adwaita [GTK3]
 \+/+o+++`o++o               ++////.   Disk: 424G / 1.7T (27%)
  .++.o+++oo+:`             /dddhhh.   CPU: 13th Gen Intel Core i5-1335U @ 12x 2.496GHz
       .+.o+oo:.          `oddhhhh+    RAM: 4426MiB / 7807MiB
        \+.++o+o``-````.:ohdhhhhh+
         `:o+++ `ohhhhhhhhyo++os:
           .o:`.syhhhhhhh/.oo++o`
               /osyyyyyyo++ooo+++/
                   ````` +oo+++o\:
                          `oo++.
```

Result:

| name        | framework | runtime | avg reqs/s | avg latency | throughput |
| ----------- | --------- | ------- | ---------- | ----------- | ---------- |
| api-json    | elysia    | bun     | 14704.61   | 8.50        | 3.27       |
| api-json    | elysia    | node    | 7003.07    | 17.92       | 1.88       |
| api-json    | h3        | bun     | 14084.20   | 8.87        | 2.93       |
| api-json    | h3        | node    | 15987.32   | 7.82        | 4.04       |
| api-text    | elysia    | bun     | 13556.04   | 9.22        | 2.57       |
| api-text    | elysia    | node    | 8009.46    | 15.59       | 2.02       |
| api-text    | h3        | bun     | 17536.14   | 7.13        | 3.06       |
| api-text    | h3        | node    | 15498.33   | 8.06        | 3.40       |
| nuxt-render | elysia    | bun     | 1173.03    | 107.59      | 1.90       |
| nuxt-render | elysia    | node    | 665.51     | 186.77      | 1.12       |
| nuxt-render | h3        | bun     | 1019.14    | 123.27      | 1.72       |
| nuxt-render | h3        | node    | 929.24     | 133.59      | 1.63       |

Remarks:

- Prefer running the Nuxt app in Bun instead of Node.js if possible.
- There is no performance benefit from using Elysia instead of H3 in Node.js;
  in fact, there is noticeable slowdown due to the native Response overhead
  (H3 directly works with the native HTTP payload).
- There is no noticeable performance issue with the server-side API client
  (Elysia: Eden Treaty, Nitro: mock ofetch).

## Contributing

Requirements:

- Bun
- Node.js

Development steps:

1. Clone this repository
2. Install dependencies: `bun install`
3. Stub modules for development: `bun dev:prepare`
4. Run playground in development mode: `bun dev`
5. Run lint: `bun lint`
6. Run typecheck: `bun test:types`
7. Testing:
  - Testing in Node.js:
    1. Run `bun dev` in separate terminal
    2. Run `bun test`
  - Testing in Bun:
    1. Run `bun dev:bun` in separate terminal
    2. Run `bun test`
  - Test building output:
    - Node.js: `bun dev:build`
    - Bun: `bun dev:build:bun`
  - Running built output:
    - Node.js: `bun dev:start`
    - Bun: `bun dev:start:bun`

## License

[MIT License](./LICENSE)
