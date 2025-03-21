import { Elysia, t } from 'elysia'
import { defineElysiaApp } from '../../src/runtime/utils'

export default defineElysiaApp(async () => {
  // NOTE: For some reason Elysia cannot infer the returned type, so we need to
  // specify the type in response
  const app = new Elysia()
    .get('/hello', () => {
      return 'Hello world!'
    }, {
      response: t.String(),
    })
    .get('/api-hello', () => {
      return {
        status: 'ok',
        message: 'Hello world!',
      }
    }, {
      response: t.Object({
        status: t.String(),
        message: t.String(),
      }),
    })

  return app
})
