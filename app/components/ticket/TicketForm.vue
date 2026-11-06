<template>
	<form class="space-y-2" @submit.prevent="handleSubmit">
		<p class="text-sm text-base-content/75">
			Les champs marqués d’un astérisque (*) sont obligatoires.
		</p>

		<div v-if="error" role="alert" class="alert alert-error">
			{{ error }}
		</div>

		<!-- title -->
		<div class="fieldset">
			<label for="ticket-title" class="fieldset-legend"
				>Titre de l’incident
				<span class="text-error" aria-hidden="true">*</span></label
			>
			<input
				id="ticket-title"
				name="title"
				type="text"
				class="input w-full"
				:class="{ 'input-error': errors.title }"
				placeholder="Ex. : Impossible de me connecter au VPN"
				minlength="5"
				maxlength="120"
				required
				:aria-invalid="errors.title ? 'true' : undefined"
				:aria-describedby="
					errors.title
						? 'ticket-title-hint ticket-title-error'
						: 'ticket-title-hint'
				"
				v-model="title"
			/>
			<p id="ticket-title-hint" class="text-sm text-base-content/75">
				Entre 5 et 120 caractères.
			</p>
			<p
				v-if="errors.title"
				id="ticket-title-error"
				class="text-sm text-error"
			>
				{{ errors.title }}
			</p>
		</div>

		<!-- categorie -->
		<div class="fieldset">
			<label for="ticket-category" class="fieldset-legend"
				>Catégorie
				<span class="text-error" aria-hidden="true">*</span></label
			>
			<select
				id="ticket-category"
				name="categoryId"
				class="select w-full"
				:class="{ 'select-error': errors.categoryId }"
				required
				:aria-invalid="errors.categoryId ? 'true' : undefined"
				:aria-describedby="
					errors.categoryId ? 'ticket-category-error' : undefined
				"
				v-model="categoryId"
			>
				<option value="">Choisir une catégorie</option>
				<option
					v-for="category in categories"
					:key="category.id"
					:value="category.id"
				>
					{{ category.name }}
				</option>
			</select>
			<p
				v-if="errors.categoryId"
				id="ticket-category-error"
				class="text-sm text-error"
			>
				{{ errors.categoryId }}
			</p>
		</div>

		<!-- Priority -->
		<fieldset
			class="fieldset"
			:aria-describedby="
				errors.priority ? 'ticket-priority-error' : undefined
			"
		>
			<legend class="fieldset-legend">
				Priorité <span class="text-error" aria-hidden="true">*</span>
			</legend>
			<div class="join join-vertical w-full sm:join-horizontal">
				<input
					v-for="(label, value) in PRIORITY_LABELS"
					:key="value"
					type="radio"
					name="priority"
					class="join-item btn flex-1"
					:value="value"
					:aria-label="label"
					required
					v-model="priority"
				/>
			</div>
			<p
				v-if="errors.priority"
				id="ticket-priority-error"
				class="text-sm text-error"
			>
				{{ errors.priority }}
			</p>
		</fieldset>

		<!-- Description -->
		<div class="fieldset">
			<label for="ticket-description" class="fieldset-legend"
				>Description détaillée
				<span class="text-error" aria-hidden="true">*</span></label
			>
			<textarea
				id="ticket-description"
				name="description"
				class="textarea w-full"
				:class="{ 'textarea-error': errors.description }"
				rows="6"
				placeholder="Décrivez les étapes pour reproduire le problème et les messages d’erreur affichés."
				minlength="10"
				maxlength="2000"
				required
				:aria-invalid="errors.description ? 'true' : undefined"
				:aria-describedby="
					errors.description
						? 'ticket-description-hint ticket-description-error'
						: 'ticket-description-hint'
				"
				v-model="description"
			></textarea>
			<p
				id="ticket-description-hint"
				class="text-sm text-base-content/75"
			>
				Entre 10 et 2 000 caractères, texte brut.
			</p>
			<p
				v-if="errors.description"
				id="ticket-description-error"
				class="text-sm text-error"
			>
				{{ errors.description }}
			</p>
		</div>

		<!-- Attachment -->
		<div class="fieldset">
			<label for="ticket-attachment" class="fieldset-legend"
				>Pièces jointes (facultatif)</label
			>
			<input
				id="ticket-attachment"
				name="attachment"
				type="file"
				class="file-input w-full"
				:class="{ 'file-input-error': errors.attachment }"
				accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
				multiple
				:aria-invalid="errors.attachment ? 'true' : undefined"
				:aria-describedby="
					errors.attachment
						? 'ticket-attachment-hint ticket-attachment-error'
						: 'ticket-attachment-hint'
				"
				@change="onFileChange"
			/>
			<p id="ticket-attachment-hint" class="text-sm text-base-content/75">
				PNG, JPG ou PDF, 2 Mo maximum par fichier, 3 fichiers maximum
			</p>
			<p
				v-if="errors.attachment"
				id="ticket-attachment-error"
				class="text-sm text-error"
			>
				{{ errors.attachment }}
			</p>
		</div>

		<!-- Submit button -->
		<div
			class="flex flex-wrap justify-end gap-2 border-t border-base-300 pt-4"
		>
			<NuxtLink to="/dashboard" class="btn btn-ghost" @click="clearDraft('ticket')">Annuler</NuxtLink>
			<button type="submit" class="btn btn-primary" :disabled="pending">
				<span
					v-if="pending"
					class="loading loading-spinner loading-sm"
					aria-hidden="true"
				></span>
				{{ pending ? "Envoi en cours…" : "Envoyer le ticket" }}
			</button>
		</div>

		<!-- Confirmation modal -->
		<dialog
			ref="confirmDialog"
			class="modal"
			aria-labelledby="confirm-title"
		>
			<div class="modal-box">
				<h3 id="confirm-title" class="text-lg font-bold">
					Envoyer le ticket ?
				</h3>
				<p class="py-4">
					Vérifiez vos informations : une fois envoyé, le ticket sera
					transmis au support.
				</p>
				<div class="modal-action">
					<button type="button" class="btn btn-ghost" @click="closeConfirm">
						Modifier
					</button>
					<button type="button" class="btn btn-primary" @click="confirmSubmit">
						Confirmer l’envoi
					</button>
				</div>
			</div>
		</dialog>
	</form>
</template>

<script setup lang="ts">
/**
 * @file Ticket creation form: validates the fields, keeps a draft, asks for confirmation
 * in a modal, then emits the values for the parent page to save.
 */

import type { Category, TicketFormErrors, TicketPriority } from "~/types";

withDefaults(
	defineProps<{
		/** Active categories only. */
		categories: Category[];
		/** Validation messages displayed under the fields. */
		errors?: TicketFormErrors;
		/** Disables the button and shows a spinner while the ticket is being sent. */
		pending?: boolean;
		/** Global error (network, refusal from Firebase). */
		error?: string;
	}>(),
	{ errors: () => ({}) },
);

/** Draft saved in localStorage, without the attachments: a file cannot be stored there. */
const draft = useDraft("ticket", { title: "", categoryId: "", priority: "medium" as TicketPriority, description: "" });
const { title, categoryId, priority, description } = toRefs(draft.value);

// Title
/** Whether the trimmed title has between 5 and 120 characters. */
const isTitleValid = computed(()=>
	title.value.trim().length >=5 && title.value.trim().length <= 120
)

// Category
/** Whether a category is selected. */
const isCategoryValid = computed(()=>
	categoryId.value !== ''
)
// Priority 


// Attachment
/** Files selected by the user. */
const attachments = ref<File[]>([])

/**
 * Stores the files selected in the file input.
 *
 * @param event - Change event of the file input.
 */
function onFileChange(event: Event) {
	const input = event.target as HTMLInputElement
	attachments.value = input.files ? Array.from(input.files) : []
}

/** MIME types accepted for attachments. */
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"]

/** Whether there are at most 3 files, each of an allowed type and at most 2 MB. */
const isAttachmentValid = computed(()=>
	attachments.value.length <= 3 &&
	attachments.value.every((file)=> file.size <=2 * 1024 * 1024) &&
	attachments.value.every((file) => ALLOWED_TYPES.includes(file.type))

)

// Description
/** Whether the trimmed description has between 10 and 2000 characters. */
const isDescriptionValid = computed(()=>
	description.value.trim().length >= 10 && description.value.trim().length <= 2000
)

const emit = defineEmits<{
	/** Emitted once the user has confirmed, with the trimmed values and the selected files. */
	submit: [data: { title: string; categoryId: string; priority: TicketPriority; description: string; attachments: File[] }]
}>()

/**
 * Opens the confirmation modal when the form is valid.
 *
 * @todo Show a message when the attachments are invalid: the submission currently stops silently.
 */
function handleSubmit() {
	if (!isTitleValid.value || !isCategoryValid.value || !isAttachmentValid.value || !isDescriptionValid.value ) return

	// Formulaire valide : on demande confirmation avant d'envoyer
	confirmDialog.value?.showModal()
}

// Confirmation modal
/** Confirmation modal element. */
const confirmDialog = ref<HTMLDialogElement | null>(null)

/** Closes the confirmation modal, leaving the form as it is. */
function closeConfirm() {
	confirmDialog.value?.close()
}

/** Closes the confirmation modal and emits the form values. */
function confirmSubmit() {
	closeConfirm()
	emit("submit", {
		title: title.value.trim(),
		categoryId: categoryId.value,
		priority: priority.value,
		description: description.value.trim(),
		attachments: attachments.value,
	})
}

</script>
