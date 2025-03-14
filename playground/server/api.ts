import { Elysia } from 'elysia'
import { defineElysiaApp } from '../../src/runtime/utils'

export default defineElysiaApp(async () => {
  return new Elysia()
    .get('/hello', () => 'Hello world!')
    .get('/api-hello', () => {
      return {
        status: 'success',
        message: 'Hello world!',
      }
    })
})
