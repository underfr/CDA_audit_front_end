<!--
  @file Root component: renders the current page inside its layout and announces route changes
  to assistive technologies.
-->
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
