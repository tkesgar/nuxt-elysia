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

    const [text, expectedText] = await Promise.all([
      nuxtResponse.text(),
      bunResponse.text(),
    ])
    expect(text).toEqual(expectedText)

    const contentType = nuxtResponse.headers.get('content-type')
    const expectedContentType = bunResponse.headers.get('content-type')
    expect(contentType).toEqual(expectedContentType)
  })
})

describe('/html', () => {
  it('should have the same response between Nuxt app and app.listen', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/html'),
      fetch('http://localhost:3001/html'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)

    const [text, expectedText] = await Promise.all([
      nuxtResponse.text(),
      bunResponse.text(),
    ])
    expect(text).toEqual(expectedText)

    const contentType = nuxtResponse.headers.get('content-type')
    const expectedContentType = bunResponse.headers.get('content-type')
    expect(contentType).toEqual(expectedContentType)
  })
})

describe('/json', () => {
  it('should have the same response between Nuxt app and app.listen', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/json'),
      fetch('http://localhost:3001/json'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)

    const [body, expectedBody] = await Promise.all([
      nuxtResponse.json(),
      bunResponse.json(),
    ])
    expect(body).toEqual(expectedBody)
  })
})
