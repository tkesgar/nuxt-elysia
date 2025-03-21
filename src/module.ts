import fsp from 'node:fs/promises'
import { defineNuxtModule, createResolver, addServerPlugin, addPlugin, addTemplate, addTypeTemplate } from '@nuxt/kit'
import pkg from '../package.json'

export interface ModuleOptions {
  /**
   * Specifies the module that exports a function that returns Elysia app as
   * its default export:
   *
   * ```ts
   * export default () => {
   *   return new Elysia()
   * }
   * ```
   *
   * Use `defineElysiaApp` utility to help with typing the function:
   *
   * ```ts
   * export default defineElysiaApp(({ nitroApp }) => {
   *   // ...
   * })
   * ```
   *
   * The default value `~~/api` is a Nuxt default alias for `/api` path in
   * the Nuxt project root, which may resolve to `<root>/api.ts` or
   * `<root>/api/index.ts`.
   *
   * Default: `~~/api`
   */
  module: string
  /**
   * Specifies the path to mount the Elysia app.
   *
   * The default value is `/_api`. You can change this value to avoid conflict
   * with other modules or using specific paths, e.g. `/v1/api`.
   *
   * Note that Elysia instance will take over all requests on the specified
   * path. Therefore, avoid using commonly used paths such as `/api`.
   *
   * To skip mounting the Elysia app, set this value to empty string (`''`).
   * You can still access the Elysia instance via the event context, for example
   * in API routes:
   *
   * ```ts
   * // server/api/custom/[...slug].ts
   *
   * export default defineEventHandler(event => {
   *   event.context._elysiaApp // Elysia app instance
   * })
   * ```
   *
   * Note that disabling mounting the Elysia app will also disable the Eden
   * Treaty plugin on client-side.
   *
   * Default: `/_api`
   */
  path: string
  /**
   * Whether to enable Eden Treaty plugin.
   *
   * The plugin will mount Eden Treaty at `$api`. Additional configuration for
   * the treaty instance can be specified in `app.config.ts`:
   *
   * ```ts
   * export default defineAppConfig({
   *   treatyConfig: {
   *     // ...
   *   }
   * })
   * ```
   *
   * See {@link https://elysiajs.com/eden/overview | Eden Treaty documentation}
   * for more details.
   *
   * You can disable the plugin if you do not intend to use Eden Treaty, or use
   * a custom Eden Treaty.
   *
   * Default: `true`
   */
  treaty: boolean
  /**
   * Specifies how the Elysia app is mounted. Currently there are several
   * options available:
   *
   * - `stack`: mount the app as the first handler in the internal H3 app stack.
   * - `route`: mount the app as a H3 route.
   *
   * Default: `stack`
   */
  mountType: 'stack' | 'handler'
}

async function renderTemplate(templatePath: string, data: Record<string, string>) {
  const template = await fsp.readFile(templatePath, { encoding: 'utf-8' })
  return template.replaceAll(/<%\s*\w+\s*%>/g, (pattern) => {
    const key = pattern.slice(2, -2).trim()

    const value = data[key]
    if (typeof value === 'undefined') {
      throw new TypeError(`Cannot find value '${key}' in template data`)
    }

    return value
  })
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: pkg.name,
    version: pkg.version,
    configKey: 'nuxtElysia',
  },
  defaults: {
    module: '~~/api',
    path: '/_api',
    treaty: true,
  },
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Register types
    addTypeTemplate({
      filename: './nuxt-elysia/types.d.ts',
      async getContents() {
        const templatePath = resolver.resolve('./runtime/templates/types.template')
        return renderTemplate(templatePath, {
          module: _options.module,
          path: _options.path,
        })
      },
      write: true,
    })

    // Register server plugin
    {
      const tmpl = addTemplate({
        filename: './nuxt-elysia/server-plugin.ts',
        async getContents() {
          const templatePath = resolver.resolve('./runtime/templates/server-plugin.template')
          return renderTemplate(templatePath, {
            module: _options.module,
            path: _options.path,
          })
        },
        write: true,
      })
      addServerPlugin(tmpl.dst)
    }

    // Register client plugin
    if (_options.path && _options.treaty) {
      const tmpl = addTemplate({
        filename: './nuxt-elysia/client-plugin.ts',
        async getContents() {
          const templatePath = resolver.resolve('./runtime/templates/client-plugin.template')
          return renderTemplate(templatePath, {
            path: _options.path.slice(1),
          })
        },
        write: true,
      })
      addPlugin(tmpl.dst)
    }
  },
})
