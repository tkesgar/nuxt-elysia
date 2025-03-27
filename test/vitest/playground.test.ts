import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import type { Server } from 'elysia/universal'
import createApp from '../../playground/api'

let appServer: Server

beforeAll(async () => {
  const response = await fetch('http://localhost:3000/ping')
  if ((await response.text()) !== 'pong') {
    throw new Error(`/ping does not respond with pong`)
  }

  new Elysia({ adapter: node() })
    .use(await createApp())
    .listen(3001, (server) => {
      appServer = server
    })
})

afterAll(() => {
  appServer.stop()
})

describe('/plaintext', () => {
  it('should have the same response between Nuxt app and app.listen', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/plaintext'),
      fetch('http://localhost:3001/plaintext'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)
    expect(await nuxtResponse.text()).toEqual(await bunResponse.text())

    const contentType = nuxtResponse.headers.get('content-type')
    expect(contentType).toContain('text/plain')
    expect(contentType).toMatch(/utf-?8/i)
  })
})

describe('/html', () => {
  it('should have the same response between Nuxt app and app.listen', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/html'),
      fetch('http://localhost:3001/html'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)
    expect(await nuxtResponse.text()).toEqual(await bunResponse.text())
    expect(nuxtResponse.headers.get('content-type')).toBe('text/html')
  })
})

describe('/json', () => {
  it('should have the same response between Nuxt app and app.listen', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/json'),
      fetch('http://localhost:3001/json'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)
    expect(await nuxtResponse.json()).toEqual(await bunResponse.json())
  })
})
