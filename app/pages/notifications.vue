<script setup lang="ts">
import type { AppNotification } from '../types'

const notifications = ref<AppNotification[]>([
    { id: 1, title: 'Nouveau ticket', message: 'Un ticket a été créé par Marie.', date: '04/11/2026', read: false },
    { id: 2, title: 'Commentaire', message: 'Paul a commenté le ticket #12.', date: '03/11/2026', read: false },
    { id: 3, title: 'Ticket résolu', message: 'Le ticket #8 a été résolu.', date: '02/11/2026', read: true },
])

function markAsRead(notification: AppNotification) {
    notification.read = true
}

function markAllAsRead() {
    notifications.value.forEach((n) => (n.read = true))
}
</script>

<template>
    <main class="mx-auto max-w-3xl space-y-4 p-4 sm:p-6 lg:p-8">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Notifications</h1>
            <button class="btn btn-sm btn-outline" @click="markAllAsRead">Tout marquer comme lu</button>
        </div>

        <p v-if="notifications.length === 0" class="text-base-content/75">Aucune notification.</p>

        <ul v-else class="space-y-2">
            <li v-for="notification in notifications" :key="notification.id"
                class="card border border-base-300 bg-base-100 p-4" :class="{ 'border-primary': !notification.read }">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="font-semibold">{{ notification.title }}</p>
                        <p class="text-sm">{{ notification.message }}</p>
                        <p class="text-xs text-base-content/75">{{ notification.date }}</p>
                    </div>

                    <button v-if="!notification.read" class="btn btn-xs btn-primary" @click="markAsRead(notification)">
                        Marquer comme lu
                    </button>
                </div>
            </li>
        </ul>
    </main>
</template>