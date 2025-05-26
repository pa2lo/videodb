<script setup>
import { t } from '@/labels'

const model = defineModel()

const props = defineProps({
	options: Array,
	label: String,
	labelNote: String
})

const id = `radio-${crypto.randomUUID()}`
</script>

<template>
	<div class="blockLabel baseLine">
		<span class="blockLabel-label">{{ t(label) }} <span v-if="labelNote">{{ labelNote }}</span></span>
		<div class="radioGroup">
			<label v-for="option in options" class="radioGroup-label" :class="{isChecked: model == option.value}">
				<input class="sr-only" type="radio" :name="id" v-model="model" :value="option.value" />
				<span class="radioGroup-title">{{ t(option.title) }}</span>
			</label>
		</div>
	</div>
</template>