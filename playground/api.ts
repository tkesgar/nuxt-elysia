import { Elysia } from 'elysia'

export default async () => {
  const app = new Elysia()
    .get('/plaintext', () => 'Hello world!')
    .get('/html', ({ set }) => {
      set.headers['content-type'] = 'text/html'
      return `<div>
  <h1>Hello world!</h1>
  <p>It works!</p>
</div>`
    })
    .get('/json', () => {
      return {
        status: 'ok',
        message: 'Hello world!',
      }
    })
    .get('/hello', () => {
      return 'Hello world!'
    })
    .get('/api-hello', () => {
      return {
        status: 'ok',
        message: 'Hello world!',
      }
    })
    .get('/secret-cookie', ({ cookie }) => {
      return cookie.secret?.value || '-'
    })
    .get('/complex-json', () => {
      return {
        randomNumber: Math.random(),
        uuid: crypto.randomUUID(),
        date: new Date(),
      }
    })

  return app
}
