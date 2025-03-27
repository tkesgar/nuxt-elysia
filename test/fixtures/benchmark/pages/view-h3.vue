<template>
  <pre>{{ payload }}</pre>
</template>

<script setup lang="ts">
const { data: payload } = await useFetch('/api/json')
</script>
