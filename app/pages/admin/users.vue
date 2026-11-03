<script setup lang="ts">
import { users } from '~/fixtures/testData'

useHead({ title: 'Utilisateurs' })
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Utilisateurs"
      subtitle="Rôles et accès des comptes. Un nouveau compte reçoit toujours le rôle Collaborateur."
    />

    <div
      role="region"
      aria-label="Liste des utilisateurs"
      tabindex="0"
      class="overflow-x-auto rounded-box border border-base-300 bg-base-100"
    >
      <table class="table">
        <caption class="sr-only">Liste des utilisateurs</caption>
        <thead class="text-base-content/75">
          <tr>
            <th scope="col">Utilisateur</th>
            <th scope="col">Rôle</th>
            <th scope="col">Statut</th>
            <th scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <p class="font-semibold">{{ user.displayName }}</p>
              <p class="text-sm text-base-content/75">{{ user.email }}</p>
            </td>
            <td>
              <label :for="`role-${user.id}`" class="sr-only">Rôle de {{ user.displayName }}</label>
              <select :id="`role-${user.id}`" name="role" class="select select-sm w-52">
                <option v-for="(label, value) in ROLE_LABELS" :key="value" :value="value" :selected="value === user.role">{{ label }}</option>
              </select>
            </td>
            <td>
              <span class="badge badge-sm w-20" :class="user.active ? 'badge-success' : 'badge-ghost'">
                {{ user.active ? 'Actif' : 'Désactivé' }}
              </span>
            </td>
            <td class="text-right">
              <button type="button" class="btn btn-ghost btn-sm">
                {{ user.active ? 'Désactiver' : 'Réactiver' }}
                <span class="sr-only">{{ user.displayName }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
