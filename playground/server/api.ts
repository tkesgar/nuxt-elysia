import { Elysia } from 'elysia'
import type { NitroApp } from 'nitropack'

// TODO Export these as utility

interface ElysiaFactoryContext {
  nitroApp: NitroApp
}

type ElysiaFactoryFn<T extends Elysia> = (ctx: ElysiaFactoryContext) => T | Promise<T>

const defineElysiaApp = <T extends Elysia>(fn: ElysiaFactoryFn<T>) => fn

export default defineElysiaApp(async () => {
  return new Elysia()
    .get('/hello', () => 'Hello world!')
    .get('/api-hello', () => {
      return {
        status: 'success',
        message: 'Hello world!',
      }
    })
})
