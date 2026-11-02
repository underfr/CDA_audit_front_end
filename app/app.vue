<!-- Exemple utilisation firebase
<script setup lang="ts">
  import { ref as dbRef, onValue } from 'firebase/database'

  const { $db } = useNuxtApp()
  const data = ref()

  onMounted(() => {
    onValue(dbRef($db, 'test'), (snap) => { data.value = snap.val() })
  })
</script>
-->

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
