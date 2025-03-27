import { buildNuxt } from '@nuxt/kit'
import { loadNuxt } from 'nuxt'

await buildNuxt(await loadNuxt({ cwd: './test/fixtures/test-app' }))
