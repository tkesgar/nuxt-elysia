import Elysia from 'elysia'
import createElysiaApp from '../../api'

type ElysiaApp = Awaited<ReturnType<typeof createElysiaApp>>

declare module 'h3' {
  interface H3EventContext {
    _elysiaApp: ElysiaApp
  }
}

export default defineNitroPlugin(async (nitroApp) => {
  const app = await createElysiaApp({
    nitroApp,
  })

  nitroApp.hooks.hook('request', (event) => {
    event.context._elysiaApp = app
  })

  // https://bun.sh/guides/util/detect-bun
  const isBun = Boolean(process.versions.bun)

  const appPath = '/_api'

  const wrappedApp = new Elysia({
    prefix: appPath,
    ...(isBun && { adapter: (await import('@elysiajs/node')).node() }),
  }).use(app)

  nitroApp.h3App.stack.unshift({
    route: appPath,
    // TODO See if Elysia can be configured to not return a response
    // If the handle does not return a response, h3 will move to the next route in stack.
    // If we can do this then we can register Elysia as '/' route
    // https://h3.unjs.io/guide/app#registering-event-handlers
    handler: fromWebHandler(wrappedApp.handle),
  })
})
