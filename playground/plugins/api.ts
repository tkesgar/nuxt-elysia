import type { Treaty } from '@elysiajs/eden'
import { treaty } from '@elysiajs/eden'

type ElysiaApp = import('h3').H3EventContext['_elysiaApp']

declare module 'nuxt/schema' {
  interface AppConfig {
    /** Theme configuration */
    treatyConfig?: Treaty.Config
  }
}

export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  const appConfig = useAppConfig()
  const appPath = '/_api'

  const api = treaty<ElysiaApp>(
    // TODO Append base URL from Nuxt
    event?.context._elysiaApp ?? (() => {
      const runtimeConfig = useRuntimeConfig()
      return window.location.origin + runtimeConfig.app.baseURL + appPath.slice(1)
    })(),
    appConfig.treatyConfig,
  )

  return {
    provide: { api },
  }
})
