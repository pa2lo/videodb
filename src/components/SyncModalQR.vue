<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
	code: String
})

const qrCanvas = ref(null)

onMounted(async () => {
	if (props.code && qrCanvas.value) {
		const QRCode = await import('qrcode');
  		QRCode.toCanvas(qrCanvas.value, props.code, {
			margin: 1,
			width: 240
		});
	}
})
</script>

<template>
	<div class="qr-cont">
		<canvas class="qr-canvas" ref="qrCanvas" />
	</div>
</template>