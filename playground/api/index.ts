import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'

export default async () => {
  const app = new Elysia()
    .get('/hello', () => {
      return 'Hello world!'
    })
    .get('/api-hello', () => {
      return {
        status: 'ok',
        message: 'Hello world!',
      }
    })
    .use(swagger())

  return app
}
