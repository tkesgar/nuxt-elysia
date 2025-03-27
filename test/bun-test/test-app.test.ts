import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { loadNuxt } from 'nuxt'
import { buildNuxt } from '@nuxt/kit'
import createApp from '../fixtures/test-app/api'

let nuxtCmd: ReturnType<typeof Bun.spawn>
let serve: ReturnType<typeof Bun.serve>

beforeAll(async () => {
  const serverModuleExists = await Bun.file('./test/fixtures/test-app/.output/server/index.mjs').exists()
  if (Boolean(Bun.env.TEST_FORCE_BUILD) || (!serverModuleExists)) {
    console.log('Test Nuxt app is not built yet, building...')
    const nuxt = await loadNuxt({ cwd: './test/fixtures/test-app', defaultConfig: { nitro: { preset: 'bun' } } })
    await buildNuxt(nuxt)
  }

  nuxtCmd = Bun.spawn(['bun', './test/fixtures/test-app/.output/server/index.mjs'])
  Bun.sleepSync(1000)

  serve = Bun.serve({
    fetch: createApp().fetch,
    port: 3001,
  })
})

afterAll(async () => {
  await nuxtCmd.kill()
  await serve.stop()
})

describe('/plaintext', () => {
  it('should have the same response between Nuxt app and Bun.serve', async () => {
    const [nuxtResponse, bunResponse] = await Promise.all([
      fetch('http://localhost:3000/_api/plaintext'),
      fetch('http://localhost:3001/plaintext'),
    ])

    expect(nuxtResponse.status).toEqual(bunResponse.status)
    expect(nuxtResponse.headers).toEqual(bunResponse.headers)
    expect(await nuxtResponse.text()).toEqual(await bunResponse.text())
  })
})

describe('/html', () => {
  it.todo('should have the same response between Bun.serve and Nuxt app')
})

describe('/json', () => {
  it.todo('should have the same response between Bun.serve and Nuxt app')
})
