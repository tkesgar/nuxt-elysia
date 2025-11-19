import { Elysia } from 'elysia'

export default function complexJsonApp() {
  return new Elysia().get('/complex-json', () => {
    return {
      randomNumber: Math.random(),
      uuid: crypto.randomUUID(),
      date: new Date(),
      buffer: Buffer.from('Hello world!'),
    }
  })
}
