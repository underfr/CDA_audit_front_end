<script setup lang="ts">
import { FirebaseError } from 'firebase/app'
import { onValue, ref as dbRef, remove, update } from 'firebase/database'
import type { Role, UserProfile } from '~/types'


definePageMeta({ roles: ['admin'] })
useHead({ title: 'Utilisateurs' })


const { $db } = useNuxtApp()
const profile = useProfile()
const createAccount = useCreateAccount()


const users = ref<UserProfile[]>([])
const listPending = ref(true)
const listError = ref('')


const stopListening = onValue(
    dbRef($db, 'users'),
    (snapshot) => {
      users.value = Object.entries<Omit<UserProfile, 'id'>>(snapshot.val() ?? {})
          .map(([id, user]) => ({ id, ...user }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr'))
      listPending.value = false
    },
    () => {
      listError.value = 'Impossible de charger les utilisateurs.'
      listPending.value = false
    },
)
onUnmounted(stopListening)


const form = useDraft('user', { displayName: '', email: '', role: 'collaborator' as Role })
const creating = ref(false)
const createError = ref('')
const createSuccess = ref('')


async function submit() {
  creating.value = true
  createError.value = ''
  createSuccess.value = ''
  try {
    await createAccount({ displayName: form.value.displayName.trim(), email: form.value.email.trim(), role: form.value.role })
    createSuccess.value = `Compte créé. ${form.value.email} va recevoir un e-mail pour choisir son mot de passe.`
    Object.assign(form, { displayName: '', email: '', role: 'collaborator' })
  } catch (e) {
    createError.value = e instanceof FirebaseError && e.code === 'auth/email-already-in-use'
        ? 'Un compte existe déjà avec cet e-mail.'
        : 'La création du compte a échoué. Réessayez.'
  } finally {
    creating.value = false
  }
}


const actionError = ref('')


async function save(user: UserProfile, changes: Partial<Pick<UserProfile, 'role' | 'active'>>) {
  actionError.value = ''
  try {
    await update(dbRef($db, `users/${user.id}`), changes)
  } catch {
    actionError.value = `La modification de ${user.displayName} a échoué.`
  }
}

const userToDelete = ref<UserProfile | null>(null)
const deleting = ref(false)
const deleteError = ref('')


function askDelete(user: UserProfile) {
  if (user.id === profile?.value?.id) return 
  deleteError.value = ''
  userToDelete.value = user
}


async function confirmDelete() {
  const target = userToDelete.value
  if (!target) return
  deleting.value = true
  try {
    await remove(dbRef($db, `users/${target.id}`))
    userToDelete.value = null
  } catch {
    deleteError.value = `La suppression de ${target.displayName} a échoué.`
  } finally {
    deleting.value = false
  }
}
</script>


<template>
  <div class="space-y-6">
    <UiPageHeader
        title="Utilisateurs"
        subtitle="Créez les comptes de l’équipe et gérez leurs rôles et leurs accès."
    />


    <UiPanel title="Ajouter un utilisateur">
      <form class="space-y-4" @submit.prevent="submit">
        <div v-if="createError" role="alert" class="alert alert-error">{{ createError }}</div>
        <div role="status">
          <p v-if="createSuccess" class="alert alert-success">{{ createSuccess }}</p>
        </div>


        <div class="grid gap-4 md:grid-cols-3">
          <div class="fieldset">
            <label for="new-name" class="fieldset-legend">Nom complet</label>
            <input id="new-name" v-model="form.displayName" name="displayName" type="text" class="input w-full" maxlength="80" autocomplete="off" required />
          </div>


          <div class="fieldset">
            <label for="new-email" class="fieldset-legend">Adresse e-mail</label>
            <input id="new-email" v-model="form.email" name="email" type="email" class="input w-full" autocomplete="off" required />
          </div>


          <div class="fieldset">
            <label for="new-role" class="fieldset-legend">Rôle</label>
            <select id="new-role" v-model="form.role" name="role" class="select w-full">
              <option v-for="(label, value) in ROLE_LABELS" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
        </div>


        <button type="submit" class="btn btn-primary" :disabled="creating">
          <span v-if="creating" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
          {{ creating ? 'Création…' : 'Créer le compte' }}
        </button>
      </form>
    </UiPanel>


    <div v-if="actionError" role="alert" class="alert alert-error">{{ actionError }}</div>


    <p v-if="listPending" role="status" class="flex items-center gap-2">
      <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
      Chargement des utilisateurs…
    </p>


    <div v-else-if="listError" role="alert" class="alert alert-error">{{ listError }}</div>


    <div
        v-else
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
            <p class="font-semibold">
              {{ user.displayName }}
              <span v-if="user.id === profile?.id" class="badge badge-outline badge-sm ml-1">Vous</span>
            </p>
            <p class="text-sm text-base-content/75">{{ user.email }}</p>
          </td>
          <td>
            <label :for="`role-${user.id}`" class="sr-only">Rôle de {{ user.displayName }}</label>
            <select
                :id="`role-${user.id}`"
                name="role"
                class="select select-sm w-52"
                :value="user.role"
                :disabled="user.id === profile?.id"
                @change="save(user, { role: ($event.target as HTMLSelectElement).value as Role })"
            >
              <option v-for="(label, value) in ROLE_LABELS" :key="value" :value="value">{{ label }}</option>
            </select>
          </td>
          <td>
              <span class="badge badge-sm" :class="user.active ? 'badge-success' : 'badge-ghost'">
                {{ user.active ? 'Actif' : 'Désactivé' }}
              </span>
          </td>
          <td>
            <div class="flex items-center justify-end gap-1">
              <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  :disabled="user.id === profile?.id"
                  @click="save(user, { active: !user.active })"
              >
                {{ user.active ? 'Désactiver' : 'Réactiver' }}
                <span class="sr-only">{{ user.displayName }}</span>
              </button>

              <button
                  type="button"
                  class="btn btn-square btn-ghost btn-sm"
                  :disabled="user.id === profile?.id"
                  :aria-label="`Supprimer le compte de ${user.displayName}`"
                  @click="askDelete(user)"
              >
                <AppIcon name="trash" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <dialog
        v-if="userToDelete"
        :open="true"
        class="modal"
        aria-labelledby="delete-title"
    >
      <div class="modal-box">
        <h3 id="delete-title" class="text-lg font-bold">Supprimer cet utilisateur ?</h3>
        <p class="mt-2 text-sm text-base-content/75">
          Le compte de <span class="font-semibold">{{ userToDelete.displayName }}</span>
          ({{ userToDelete.email }}) sera retiré de l'équipe. Cette action est définitive.
        </p>
        <div v-if="deleteError" role="alert" class="alert alert-error mt-4">{{ deleteError }}</div>
        <div class="modal-action">
          <button type="button" class="btn" :disabled="deleting" @click="userToDelete = null">Annuler</button>
          <button type="button" class="btn btn-error" :disabled="deleting" @click="confirmDelete">
            <span v-if="deleting" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
            Supprimer
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" :disabled="deleting" @click="userToDelete = null">Fermer</button>
      </form>
    </dialog>
  </div>
</template> 