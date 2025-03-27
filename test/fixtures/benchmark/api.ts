import { Elysia } from 'elysia'

export default () => {
  const app = new Elysia()
    .get('/text', () => 'Hello world!')
    .get('/json', () => {
      return {
        status: 'ok',
        message: 'Hello world!',
      }
    })

  return app
}
