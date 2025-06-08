<script setup>
import { t } from '@/labels'

defineProps({
	icon: String,
	title: String,
	href: {
		type: String,
		default: '#'
	},
	isActive: Boolean
})
</script>

<template>
	<a class="menuLink" :class="{isActive}" :href>
		<i class="fa-fw menuLink-ico" :class="icon"></i>
		<span class="menuLink-text">{{ title }}</span>
		<span class="menuLink-hoverTitle" :title></span>
	</a>
</template>