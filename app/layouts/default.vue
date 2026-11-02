<template>
  <div class="drawer lg:drawer-open">
    <input id="app-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <AppTopbar />
      <main id="main" class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
    <div class="drawer-side">
      <label for="app-drawer" aria-label="Fermer le menu" class="drawer-overlay"></label>
      <AppSidebar />
    </div>
  </div>
</template>