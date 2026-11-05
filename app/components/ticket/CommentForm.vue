<script setup lang="ts">
defineProps<{
  pending?: boolean
  error?: string
}>()

const body = defineModel<string>({ required: true })
const emit = defineEmits<{ submit: [] }>()
</script>

<template>
  <form class="space-y-2 border-t border-base-300 pt-4" @submit.prevent="emit('submit')">
    <div v-if="error" role="alert" class="alert alert-error">{{ error }}</div>

    <label for="comment-body" class="block text-sm font-semibold">Ajouter un commentaire</label>
    <textarea
        id="comment-body"
        v-model="body"
        name="body"
        class="textarea w-full"
        rows="3"
        maxlength="1000"
        required
        aria-describedby="comment-body-hint"
    ></textarea>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <p id="comment-body-hint" class="text-sm text-base-content/75">1 000 caractères maximum, texte brut.</p>
      <button type="submit" class="btn btn-primary btn-sm" :disabled="pending || !body.trim()">
        <span v-if="pending" class="loading loading-spinner loading-xs" aria-hidden="true"></span>
        {{ pending ? 'Publication…' : 'Publier' }}
      </button>
    </div>
  </form>
</template>