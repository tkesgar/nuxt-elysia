<template>
  <div id="secretCookie">
    Secret cookie: {{ secretCookie }}
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

const { data: secretCookie } = await useAsyncData(async () => {
  const { data, error } = await $api['secret-cookie'].get()

  if (error) {
    throw new Error('Failed to fetch API')
  }

  return data
})
</script>
