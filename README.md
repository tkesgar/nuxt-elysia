# nuxt-elysia

> Use Elysia app in Nuxt

## Features

- [v] Mount Elysia in Nuxt in a specific path
- [v] Eden Treaty integration
  - [v] End-to-end type safety
  - [v] Isomorphic client: works in both server and client side
- [v] Works in both Node.js and Bun

## Setup

Install the package:

```
# Bun
bun add nuxt-elysia -D
bun add elysia @elysiajs/eden

# NPM
npm install nuxt-elysia --save-dev
npm install elysia @elysiajs/eden
```

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
directly handling the HTTP request, there may be several quirks in the

Our goal is for the following implementations to work the same ,i.e. returning
matching HTTP headers and responses:

1. Elysia app run directly in Bun server
2. Elysia app internal request (via `Elysia.handle`)
3. Elysia app external request (via `/_api` endpoint)

You can check `server-plugin.ts` generated from `server-plugin.template` for
the list of currently implemented workarounds.

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

## Contributing

Requirements:

- Bun
- Node.js

Development steps:

1. Clone this repository
2. Install dependencies: `bun install`
3. Stub modules for development: `bun dev:prepare`
4. Run playground in development mode: `bun dev`

## License

[MIT License](./LICENSE)
