<script setup>
defineProps({
	icon: String,
	iconRight: String,
	dark: Boolean,
	outline: Boolean,
	smaller: Boolean,
	full: Boolean,
	basicIcon: Boolean,
	href: String
})

function returnFocus(e) {
	let focusableEl = e.target.closest('.modal, .main')
	if (focusableEl) focusableEl.focus()
	else document.querySelector('.main')?.focus()
}
</script>

<template>
	<component
		:is="href ? 'a' : 'button'"
		class="button"
		:class="{
			buttonDark: dark,
			buttonOutline: outline,
			isSmaller: smaller,
			isFull: full,
			isIconOnly: !$slots.default,
			basicIcon: basicIcon
		}"
		:href="href"
		@focus="$attrs.onFocus ? null : returnFocus($event)"
	>
		<i v-if="icon" :class="icon" />
		<slot />
		<i v-if="iconRight" :class="iconRight" />
	</component>
</template>