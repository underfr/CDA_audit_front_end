<script setup lang="ts">
const profile = useProfile()
const items = computed(()=> NAVIGATION.filter(item=>!item.roles || (profile.value && item.roles.includes(profile.value.role))))
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-field focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content"
    >
      Aller au contenu
    </a>

    <div class="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" class="drawer-toggle" />

      <div class="drawer-content flex min-w-0 flex-col">
        <AppTopbar v-if="profile" :user="profile" />
        <main id="main" tabindex="-1" class="mx-auto w-full max-w-7xl flex-1 p-4 focus:outline-none sm:p-6 lg:p-8">
          <slot />
        </main>
      </div>

      <div class="drawer-side z-20">
  <label for="app-drawer" class="drawer-overlay" aria-hidden="true"></label>
  <AppSidebar :items="items" />
</div>
    </div>
  </div>
</template>
