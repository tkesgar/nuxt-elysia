import fsp from 'node:fs/promises'
import { defineNuxtModule, createResolver, addServerPlugin, addPlugin, addTemplate, addTypeTemplate } from '@nuxt/kit'
import pkg from '../package.json'

export interface ModuleOptions {
  module: string
  path: string
  treaty: boolean
  append?: boolean
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
    if (_options.treaty) {
      const tmpl = addTemplate({
        filename: './nuxt-elysia/client-plugin.ts',
        async getContents() {
          const templatePath = resolver.resolve('./runtime/templates/client-plugin.template')
          return renderTemplate(templatePath, {
            module: _options.module,
            path: _options.path.slice(1),
          })
        },
        write: true,
      })
      addPlugin(tmpl.dst, { append: _options.append })
    }
  },
})
