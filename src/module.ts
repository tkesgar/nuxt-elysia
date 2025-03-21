import fsp from 'node:fs/promises'
import { defineNuxtModule, createResolver, addServerPlugin, addTemplate } from '@nuxt/kit'
import pkg from '../package.json'

export interface ModuleOptions {
  module: string
  path: string
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
    module: '../../api',
    path: '/_api',
  },
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    const tmpl = addTemplate({
      filename: './nuxt-elysia/server-plugin.ts',
      async getContents() {
        const templatePath = resolver.resolve('./runtime/templates/server-plugin.ejs')
        return renderTemplate(templatePath, {
          module: _options.module,
          path: _options.path,
        })
      },
      write: true,
    })
    addServerPlugin(tmpl.dst)
  },
})
