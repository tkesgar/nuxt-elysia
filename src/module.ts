import { defineNuxtModule, createResolver, addServerPlugin, addTemplate } from '@nuxt/kit'
import ejs from 'ejs'
import pkg from '../package.json'

export interface ModuleOptions {
  module: string
  path: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: pkg.name,
    version: pkg.version,
    configKey: 'nuxtElysia',
  },
  defaults: {
    module: '../../api',
    path: '/_api',
  },
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    const tmpl = addTemplate({
      filename: './nuxt-elysia/server-plugin.ts',
      async getContents() {
        const templatePath = resolver.resolve('./runtime/templates/server-plugin.ejs')
        const templateData = {
          module: _options.module,
          path: _options.path,
        }
        return ejs.renderFile(templatePath, templateData)
      },
      write: true,
    })
    addServerPlugin(tmpl.dst)
  },
})
