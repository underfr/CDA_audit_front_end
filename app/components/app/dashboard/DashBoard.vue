<template>
	<p>Test</p>
</template>

<script setup lang='ts'>
import { computed, watch, onMounted, onUpdated, onBeforeUnmount } from 'vue'

// v-model binding (Vue 3.4+)
const model = defineModel<string>({ default: '' });

// Props with defaults (TypeScript)
interface Props {
	text?: string;
	count?: number;
}

const props = withDefaults(defineProps<Props>(), {
	text: '',
	count: 0,
});

const emit = defineEmits({
	'update:text': (value: string) => typeof value === 'string',
});

const now = computed(() => Date.now());

const stopWatch = watch(
	model, async (_newValue: string | undefined, _oldValue: string | undefined) => {
		// do something
	},
	{
		immediate: true
	}
);

onMounted(() => {
});

onUpdated(() => {
});

onBeforeUnmount(() => {
	stopWatch();
});

</script>

<style scoped lang="css">
</style>