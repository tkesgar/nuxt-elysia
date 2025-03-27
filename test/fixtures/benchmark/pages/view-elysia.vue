<template>
  <pre>{{ payload }}</pre>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

const { data: payload } = await useAsyncData(async () => {
  const { data, error } = await $api.json.get()

  if (error) {
    throw error
  }

  return data
})
</script>
