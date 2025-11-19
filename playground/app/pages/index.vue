<template>
  <div>
    <h1>Test API</h1>

    <p>Fetch on client: <b>{{ fetchOnClient ? 'enabled' : 'disabled' }}</b></p>

    <h2>/hello</h2>
    <p>Status: {{ (!helloData && !helloError) ? 'loading' : (helloError ? 'error': 'ok') }}</p>
    <pre>{{ helloError ?? helloData }}</pre>

    <h2>/api/hello</h2>
    <p>Status: {{ (!apiHelloData && !apiHelloError) ? 'loading': (apiHelloError ? 'error': 'ok') }}</p>
    <pre>{{ apiHelloError ?? apiHelloData }}</pre>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const route = useRoute()

const fetchOnClient = computed(() => Boolean(route.query.client || (route.query.client === null)))

const { data: helloData, error: helloError } = await useAsyncData(async () => {
  const { data, error } = await $api.hello.get()

  if (error) {
    throw new Error('Cannot call /api')
  }

  return data
}, { server: !fetchOnClient.value })

const { data: apiHelloData, error: apiHelloError } = await useAsyncData(async () => {
  const { data, error } = await $api['api-hello'].get()

  if (error) {
    throw new Error('Cannot call /api')
  }

  return data
}, { server: !fetchOnClient.value })
</script>
