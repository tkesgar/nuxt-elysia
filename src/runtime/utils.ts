import type { NitroApp } from 'nitropack'
import type { Elysia } from 'elysia'

export interface ElysiaFactoryContext {
  nitroApp: NitroApp
}

export type ElysiaFactoryFn<E extends Elysia> = (ctx: ElysiaFactoryContext) => E | Promise<E>

/**
 * Helper to define Elysia factory function.
 *
 * The function runs in Nitro plugin context and will receive Nitro app instance.
 */
export const defineElysiaApp = <E extends Elysia>(fn: ElysiaFactoryFn<E>) => fn
