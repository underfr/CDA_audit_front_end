<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Déclarer un incident"
      subtitle="Décrivez le problème rencontré, le support le prendra en charge au plus vite."
      :breadcrumbs="[{ label: 'Tickets', to: '/tickets' }, { label: 'Nouveau ticket' }]"
    />

    <div class="grid items-start gap-6 xl:grid-cols-3">
      <UiPanel title="Votre demande" class="xl:col-span-2">
        <TicketForm 
			:categories="activeCategories"
			:pending="pending"
			:error="error" 
			@submit="onSubmit"/>
      </UiPanel>

      <UiPanel title="Pour un traitement rapide">
        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Un titre précis, par exemple « VPN : authentification refusée ».</li>
          <li>Le message d’erreur exact, recopié tel quel.</li>
          <li>Le numéro de votre poste ou de votre matériel.</li>
          <li>Ce que vous avez déjà essayé.</li>
        </ul>
      </UiPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CategoryService } from '~/services/firebase/category.service'
import { TicketService } from '~/services/firebase/ticket.service'


useHead({ title: 'Nouveau ticket' })

const pending = ref(false)
const error = ref("")
const profile = useProfile()
const ticketService = new TicketService()
const categoryService = new CategoryService()
const activeCategories = ref<Category[]>([])
const stopListening = categoryService.listActive((list) => {
	activeCategories.value = list
})

onUnmounted(stopListening)

async function onSubmit(data: TicketFormData) {
	const { attachments, ...fields } = data
	const category = activeCategories.value.find((c) => c.id === fields.categoryId)

	pending.value = true
	error.value = ""

	try {
		await ticketService.create({
			...fields,
			categoryName: category?.name ?? "",
			authorId: profile.value!.id,
			authorName: profile.value!.displayName,
			status: "new",
			assigneeId: null,
			assigneeName: null,
		})
		await navigateTo("/tickets")
	} catch {
		error.value = "Le ticket n'a pas pu être créé. Réessayez."
	} finally {
		pending.value = false
	}
	
}
</script>
