import fs from 'node:fs'
import { defineNuxtModule, createResolver, addServerPlugin, addPlugin, addTemplate, addTypeTemplate } from '@nuxt/kit'
import ejs from 'ejs'
import { name, version } from '../package.json'

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

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'nuxtElysia',
  },
  defaults: {
    module: '~~/api',
    path: '/_api',
    treaty: true,
  },
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    function renderTemplate<T extends ejs.Data>(name: string, data: T) {
      const templatePath = resolver.resolve(`./runtime/templates/${name}.ejs`)
      const template = fs.readFileSync(templatePath, { encoding: 'utf-8' })
      return ejs.render(template, data)
    }

    // Register types
    addTypeTemplate({
      filename: './nuxt-elysia/types.d.ts',
      getContents: () => renderTemplate('types', {
        module: _options.module,
      }),
      write: true,
    })

    // Register server plugin
    {
      const tmpl = addTemplate({
        filename: './nuxt-elysia/server-plugin.ts',
        getContents: () => renderTemplate('server-plugin', {
          module: _options.module,
          path: _options.path,
        }),
        write: true,
      })

      addServerPlugin(tmpl.dst)
    }

    // Register client plugin
    if (_options.path && _options.treaty) {
      const tmpl = addTemplate({
        filename: './nuxt-elysia/client-plugin.ts',
        getContents: () => renderTemplate('client-plugin', {
          path: _options.path,
        }),
        write: true,
      })

      addPlugin(tmpl.dst)
    }
  },
})
