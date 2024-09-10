<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

defineOptions({
	inheritAttrs: false
})

import BButton from './BButton.vue'

const open = defineModel('open')
const props = defineProps({
	title: String,
	wider: Boolean,
	narrow: Boolean
})

const emit = defineEmits(['afterEnter', 'swipeX'])

let lastFocusedEl = null
function afterModalEnter(e) {
	lastFocusedEl = document.activeElement.closest('.posterButton-info') ? document.querySelector('.main') : document.activeElement
	if (e?.classList?.contains('modal')) e.focus()
	emit('afterEnter')
}
function afterModalLeave(e) {
	if (lastFocusedEl && document.contains(lastFocusedEl)) lastFocusedEl.focus()
	else document.querySelector('.main').focus()
}
function onDeleteKey() {
	if (document.activeElement && document.activeElement.matches('input')) return
	open.value = false
}

// swipe events
let start = {
	x: null,
	y: null,
	id: null,
	containerScroll: 0,
	allowMoveDown: true
}

const moveActive = ref(false)
const offX = ref(0)
const offY = ref(0)
const containerEl = ref(null)
const isMovingDown = ref(false)

const computedStype = computed(() => {
	if (!moveActive.value) return {}
	return {
		'--off-x': offX.value,
		'--off-y': offY.value
	}
})

function onTouchStart(e) {
	if (e.touches.length > 1 || window.visualViewport.scale > 1.01) {
		if (moveActive.value) removeDomEvents()
		return
	}

	start = {
		x: e.changedTouches[0]?.clientX,
		y: e.changedTouches[0]?.clientY,
		id: e.changedTouches[0]?.identifier,
		containerScroll: containerEl.value.scrollTop,
		allowMoveDown: containerEl.value.scrollTop == 0
	}

	addDomEvents()
}
function onTouchMove(e) {
	if (window.visualViewport.scale > 1.01) return
	const { clientX: endX, clientY: endY } = e.changedTouches[0]

	const diffX = endX - start.x,
		diffY = endY - start.y,
		absX = Math.abs(diffX),
		absY = Math.abs(diffY)

	if (absX > absY) {
		offY.value = 0
		isMovingDown.value = false
		if (diffX > 0) offX.value = Math.max(0, diffX - 30)
		else offX.value = Math.min(0, diffX + 30)
	} else {
		if (offX.value != 0) offX.value = 0
		if (!start.allowMoveDown) return
		if (diffY < -5) start.allowMoveDown = false
		else {
			isMovingDown.value = 30 - diffY < 0
			offY.value = Math.max(0, diffY - 30)
		}
	}
	// if (absX > absY && absX > 80 && absY < 100) emit('findNextMedia', diffX < 0)
}
function onTouchEnd() {
	if (moveActive.value) {
		if (offY.value > 100) open.value = false
		else if (Math.abs(offX.value) > 80) emit('swipeX', offX.value < 0)
	}
	requestAnimationFrame(() => {
		removeDomEvents()
	})
}
function addDomEvents() {
	moveActive.value = true

	document.addEventListener('touchmove', onTouchMove, {passive: true})
	document.addEventListener('touchend', onTouchEnd, {passive: true})
}
function removeDomEvents() {
	offX.value = 0
	offY.value = 0
	moveActive.value = false
	isMovingDown.value = false

	document.removeEventListener('touchmove', onTouchMove)
	document.removeEventListener('touchend', onTouchEnd)
}
onBeforeUnmount(() => {
	if (moveActive.value) removeDomEvents()
})
</script>

<template>
	<Transition name="layout" mode="out-in" @afterEnter="afterModalEnter" @afterLeave="afterModalLeave">
		<div
			v-if="open"
			class="modal"
			:class="{isMovingDown: moveActive && isMovingDown}"
			@click.self="open = false"
			@keydown.esc="open = false"
			@keydown.delete="onDeleteKey"
			tabindex="-1"
			v-bind="$attrs"
			ref="containerEl"
		>
			<div class="modal-close-spacer" :style="computedStype"></div>
			<div class="modal-cont" :class="{isWider: wider, isNarrow: narrow, moveActive: moveActive}" :style="computedStype" @touchstart="onTouchStart">
				<div class="modal-buttons">
					<slot name="buttons"></slot>
					<BButton class="modal-button" @click="open = false">✕</BButton>
				</div>
				<h3 class="modal-title">{{ title }}</h3>
				<slot />
			</div>
		</div>
	</Transition>
</template>