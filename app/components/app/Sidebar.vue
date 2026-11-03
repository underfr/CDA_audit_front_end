<script setup lang="ts">
/**
 * Sidebar — main application layout and navigation ("Abstract Support"), built with daisyUI.
 * Nuxt 4 component: app/components/app/Sidebar.vue → <AppSidebar>.
 *
 * Uses the daisyUI `drawer` component: the sidebar is always visible from the `lg`
 * breakpoint (lg:drawer-open) and becomes a slide-in drawer below it. The page content is
 * passed through the default slot, from app/layouts/default.vue:
 *
 *   <AppSidebar @logout="signOut"><slot /></AppSidebar>
 *
 * Accessibility choices on top of daisyUI (the mockups are only an inspiration):
 * - semantic landmarks: <aside> + <nav aria-label> + <ul>/<li> (daisyUI `menu`);
 * - aria-current="page" on the active link (exact or nested route, e.g. /tickets/42);
 * - the drawer is opened by a real <button> (aria-expanded / aria-controls) rather than
 *   daisyUI's <label>, which is not reachable with the keyboard; the hidden checkbox is
 *   driven by Vue state and kept out of the tab order;
 * - Escape closes the drawer and gives focus back to the toggle button;
 * - visible focus ring (:focus-visible) on every interactive element.
 *
 * Log Out is a <button> (an action, not a navigation): the parent handles it through the
 * `logout` event, so this component stays independent from the BaaS.
 */
// NuxtLink and useRoute are auto-imported by Nuxt.
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type IconName = 'dashboard' | 'tickets' | 'analytics' | 'settings' | 'support' | 'logout' | 'plus'

interface NavItem {
  label: string
  to: string
  icon: IconName
}

const props = withDefaults(
  defineProps<{
    /** Main links. Override to hide items by role (e.g. Analytics for managers only). */
    items?: NavItem[]
    /** Route of the incident creation form. */
    newIncidentTo?: string
    /** Route of the help page. */
    supportTo?: string
  }>(),
  {
    items: () => [
      { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
      { label: 'Tickets', to: '/tickets', icon: 'tickets' },
      { label: 'Analytics', to: '/analytics', icon: 'analytics' },
      { label: 'Settings', to: '/settings', icon: 'settings' },
    ],
    newIncidentTo: '/tickets/new',
    supportTo: '/support',
  },
)

const emit = defineEmits<{
  /** Emitted when the user clicks "Log Out". The parent signs out and redirects. */
  (e: 'logout'): void
}>()

/** SVG paths (24×24, stroke-based, Lucide-like) so the component has no icon dependency. */
const iconPaths: Record<IconName, string> = {
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  tickets:
    'M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zM13 5v2M13 17v2M13 11v2',
  analytics: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  support: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  plus: 'M12 5v14M5 12h14',
}

const route = useRoute()

/** Drawer state (only has a visible effect below the `lg` breakpoint). */
const isOpen = ref(false)
const toggleButton = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)

/**
 * A link is active on its own route and on its child routes
 * (/tickets/42 keeps "Tickets" active). The creation form has its own button,
 * so /tickets/new does not highlight "Tickets".
 */
function isActive(to: string): boolean {
  if (route.path === props.newIncidentTo) return to === props.newIncidentTo
  return route.path === to || route.path.startsWith(`${to}/`)
}

/**
 * Focuses the first link of the drawer once it is actually visible: daisyUI switches
 * `visibility` through a CSS transition, and a hidden element cannot receive focus.
 */
function focusFirstLink(attempt = 0): void {
  const firstLink = panel.value?.querySelector<HTMLElement>('a, button')
  if (!firstLink) return
  if (getComputedStyle(firstLink).visibility === 'visible') firstLink.focus()
  else if (attempt < 30) requestAnimationFrame(() => focusFirstLink(attempt + 1))
}

async function openMenu(): Promise<void> {
  isOpen.value = true
  await nextTick()
  focusFirstLink()
}

function closeMenu(restoreFocus = true): void {
  if (!isOpen.value) return
  isOpen.value = false
  if (restoreFocus) toggleButton.value?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closeMenu()
}

// Close the drawer after a navigation (focus moves to the new page, not to the toggle).
watch(
  () => route.fullPath,
  () => closeMenu(false),
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="drawer lg:drawer-open">
    <!-- daisyUI drives the drawer with this checkbox; Vue owns its state. -->
    <input
      id="sidebar-drawer"
      v-model="isOpen"
      type="checkbox"
      class="drawer-toggle"
      tabindex="-1"
      aria-hidden="true"
    />

    <div class="drawer-content flex min-h-dvh flex-col bg-base-200">
      <!-- Mobile / tablet top bar (hidden from lg) -->
      <header class="navbar sticky top-0 z-20 border-b border-base-300 bg-base-100 lg:hidden">
        <button
          ref="toggleButton"
          type="button"
          class="btn btn-square btn-ghost"
          aria-controls="sidebar-panel"
          :aria-expanded="isOpen"
          @click="isOpen ? closeMenu() : openMenu()"
        >
          <svg class="size-6" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
          <span class="sr-only">Ouvrir le menu</span>
        </button>
        <NuxtLink to="/dashboard" class="btn btn-ghost text-lg font-bold text-primary">
          Abstract Support
        </NuxtLink>
      </header>

      <slot />
    </div>

    <div class="drawer-side z-30">
      <label for="sidebar-drawer" class="drawer-overlay" aria-hidden="true"></label>

      <aside
        id="sidebar-panel"
        ref="panel"
        class="flex min-h-full w-64 flex-col border-r border-base-300 bg-base-100 py-6"
      >
        <NuxtLink
          to="/dashboard"
          class="mx-4 mb-8 flex flex-col rounded-box px-2 py-1 focus-visible:outline-primary"
        >
          <span class="text-xl leading-tight font-bold text-primary">Abstract Support</span>
          <span class="text-xs text-base-content/70">Technical Operations</span>
        </NuxtLink>

        <nav aria-label="Navigation principale">
          <ul class="menu w-full gap-1 px-3">
            <li v-for="item in items" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="nav-link"
                :class="{ 'menu-active': isActive(item.to) }"
                :aria-current="isActive(item.to) ? 'page' : undefined"
              >
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path :d="iconPaths[item.icon]" />
                </svg>
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="mt-auto pt-6">
          <NuxtLink
            :to="newIncidentTo"
            class="btn mx-4 mb-4 w-[calc(100%-2rem)] shadow-md btn-primary"
            :aria-current="isActive(newIncidentTo) ? 'page' : undefined"
          >
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path :d="iconPaths.plus" />
            </svg>
            New Incident
          </NuxtLink>

          <ul class="menu w-full gap-1 border-t border-base-300 px-3 pt-3">
            <li>
              <NuxtLink
                :to="supportTo"
                class="nav-link"
                :class="{ 'menu-active': isActive(supportTo) }"
                :aria-current="isActive(supportTo) ? 'page' : undefined"
              >
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path :d="iconPaths.support" />
                </svg>
                Support
              </NuxtLink>
            </li>
            <li>
              <button type="button" class="nav-link" @click="emit('logout')">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path :d="iconPaths.logout" />
                </svg>
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* Only what daisyUI does not cover: icon stroke, touch target size and the mockup's active bar. */
svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.nav-link {
  min-height: 2.75rem; /* 44px touch target */
  font-size: 0.9375rem;
  border-right: 3px solid transparent;
}

/* Active item as in the mockup: light primary background, primary text, right bar. */
.menu .nav-link.menu-active {
  font-weight: 600;
  color: var(--color-primary);
  background-color: color-mix(in oklab, var(--color-primary) 12%, var(--color-base-100));
  border-right-color: var(--color-primary);
}

/* Keyboard focus always visible, also on the active item. */
.nav-link:focus-visible,
.btn:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
