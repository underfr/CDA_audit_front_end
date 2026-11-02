<template>
  <main id="main" class="grid min-h-screen place-items-center bg-base-200 p-4">
    <div class="w-full max-w-md space-y-6">
      <AppLogo class="justify-center" />
      <div class="card border border-base-300 bg-base-100">
        <div class="card-body gap-6">
          <slot />
        </div>
      </div>
    </div>
  </main>
</template>
