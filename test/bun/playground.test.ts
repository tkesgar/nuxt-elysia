import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import createApp from '../../playground/api'

let elysiaServer: ReturnType<typeof Bun.serve>

beforeAll(async () => {
  const response = await fetch('http://localhost:3000/ping')
  if ((await response.text()) !== 'pong') {
    throw new Error(`/ping does not respond with pong`)
  }

  elysiaServer = Bun.serve({
    fetch: (await createApp()).fetch,
    port: 3001,
  })
})

afterAll(async () => {
  await elysiaServer.stop()
})

describe('/plaintext', () => {
  it('should have the same response between Nuxt app and Bun.serve', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/plaintext'),
      fetch('http://localhost:3001/plaintext'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)
    expect(await nuxtResponse.text()).toEqual(await bunResponse.text())
    expect(nuxtResponse.headers.get('content-type')).toEqual(bunResponse.headers.get('content-type'))
  })
})

describe('/html', () => {
  it('should have the same response between Bun.serve and Nuxt app', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/html'),
      fetch('http://localhost:3001/html'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)
    expect(await nuxtResponse.text()).toEqual(await bunResponse.text())
    expect(nuxtResponse.headers.get('content-type')).toEqual(bunResponse.headers.get('content-type'))
  })
})

describe('/json', () => {
  it('should have the same response between Bun.serve and Nuxt app', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/json'),
      fetch('http://localhost:3001/json'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)
    expect(await nuxtResponse.json()).toEqual(await bunResponse.json())
  })
})
