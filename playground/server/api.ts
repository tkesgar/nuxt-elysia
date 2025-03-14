import { Elysia } from 'elysia'
import type { NitroApp } from 'nitropack'
import { node } from '@elysiajs/node'

// TODO Export these as utility

interface ElysiaFactoryContext {
  nitroApp: NitroApp
}

type ElysiaFactoryFn = (ctx: ElysiaFactoryContext) => Elysia | Promise<Elysia>

const defineElysiaApp = (fn: ElysiaFactoryFn) => fn

export default defineElysiaApp(async () => {
  // TODO We can lift this up to the Nitro instance itself
  const isBun = Boolean(process.versions.bun)

  return new Elysia({ adapter: isBun ? undefined : node() })
    .get('/hello', () => 'Hello world!')
    .get('/api-hello', () => {
      return {
        status: 'success',
        message: 'Hello world!',
      }
    })
})
