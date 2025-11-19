<template>
  <div>
    <h1>/api/complex-json</h1>
    <pre>{{ complexJsonData }}</pre>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

const { data: complexJsonData } = await useAsyncData(async () => {
  const { data } = await $api['complex-json'].get()
  return data
})
</script>
