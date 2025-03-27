import { Elysia } from 'elysia'

export default function createApp() {
  return new Elysia()
    .get('/plaintext', () => {
      return 'Hello world!'
    })
    .get('/html', ({ set }) => {
      set.headers['content-type'] = 'text/html'
      return `
<div>
  <h1>Hello world!</h1>
  <p>It works!</p>
</div>
      `.trim()
    })
    .get('/json', () => {
      return {
        status: 'ok',
        value: {
          id: 123,
          name: 'Hifumi',
        },
      }
    })
    .get('/buffer', () => {
      return Buffer.from([0x11, 0x22, 0x33])
    })
}
