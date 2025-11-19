import { Elysia } from 'elysia'

export default function complexJsonApp() {
  const runtimeConfig = useRuntimeConfig()

  return new Elysia().get('/complex-json', () => {
    return {
      randomNumber: Math.random(),
      uuid: crypto.randomUUID(),
      date: new Date(),
      buffer: Buffer.from('Hello world!'),
      appRuntimeConfig: runtimeConfig.app,
    }
  })
}
