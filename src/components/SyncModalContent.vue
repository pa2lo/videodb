<script setup>
import { ref } from 'vue'
import { syncKey, syncAdded, syncTS, syncError, syncing, showToast } from '@/store'
import { sync } from '@/sync'
import { t } from '@/labels'

import BButton from './BButton.vue'
import SyncModalQR from './SyncModalQR.vue'
import BModal from './BModal.vue'

const emit = defineEmits(['afterSync'])

async function copyID() {
	setTimeout(() => {
		navigator.clipboard.write([
			new ClipboardItem({	'text/plain': syncKey.value }),
		])
		showToast(t('ID copied to clipboard'), 'check')
	}, 0)
}
function formatDate(ts) {
	return new Date(ts).toLocaleString('de')
}

const syncIDModel = ref('')

const connectingForm = ref(false)
const QRAvailable = ref(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.BarcodeDetector)

const QRScannerModal = ref(false)
const QRReaderNotAvailable = ref(false)
const videoEl = ref(null)
let QRdetector
let stream

async function scanQR() {
	try {
		stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: "environment"}})
		QRScannerModal.value = true
		requestAnimationFrame(() => {
			videoEl.value.srcObject = stream
			videoEl.value.play()

			QRdetector = new BarcodeDetector({formats: ["qr_code"] })
		})
	} catch (error) {
		QRAvailable.value = false
		QRReaderNotAvailable.value = true
	}
}
function destroyCamera() {
	stream.getVideoTracks()?.[0]?.stop()
}
async function onLoadedMetadata() {
	let canvas = document.createElement('canvas')
	canvas.width = videoEl.value.videoWidth
	canvas.height = videoEl.value.videoHeight
	let context = canvas.getContext('2d')

	let checkForQrCode = async function(){
		if (!videoEl.value) return
		context.drawImage(videoEl.value, 0, 0, canvas.width, canvas.height)

		let barcodes = await QRdetector.detect(canvas)

		if (barcodes.length > 0) {
			syncIDModel.value = barcodes[0].rawValue
			QRScannerModal.value = false
			destroyCamera()
			return
		}

		requestAnimationFrame(checkForQrCode)
	}

	checkForQrCode()
}

async function connect() {
	await sync.connect(syncIDModel.value, true)
	if (syncKey.value) {
		connectingForm.value = false
		emit('afterSync')
	}
}
</script>

<template>
	<Transition name="maxHeight">
		<div v-if="syncError" class="loginBox-error modal-error">
			{{ t(syncError) }}
		</div>
	</Transition>
	<div class="searchCont">
		<div v-if="syncing" class="modal-loader"><i class="fa-solid fa-spinner fa-spin-pulse fa-3x"></i></div>
		<div v-else-if="connectingForm">
			<h3>{{ t('Connect to other device') }}</h3>
			<div class="smallerLine">
				<strong>{{ t('Insert synchonization ID') }}</strong>
			</div>
			<div class="flex smallerLine">
				<input class="input isFull" type="text" :placeholder="t('Synchronization ID')" v-model.trim="syncIDModel" required>
			</div>
			<BButton v-if="QRAvailable" class="smallerLine" full dark @click="scanQR">{{ t('Scan QR code') }}</BButton>
			<div v-if="QRReaderNotAvailable" class="loginBox-error smallerLine">
				{{ t('QR Reader not found') }}
			</div>
			<div class="settingsDivider baseLine"></div>
			<BButton class="baseLine" full :disabled="!syncIDModel.length" @click="connect">{{ t('Connect') }}</BButton>
			<BButton full dark class="smallerLine" @click="connectingForm = false">{{ t('Back') }}</BButton>
		</div>
		<div v-else-if="!syncKey">
			<h3>{{ t('Synchronization inactive') }}</h3>
			<div class="line">
				<BButton full class="smallerLine" :disabled="syncing" @click="connectingForm = true">{{ t('Connect to other device') }}</BButton>
				<BButton full class="smallerLine" :disabled="syncing" @click="sync.newSync()">{{ t('New synchronization') }}</BButton>
			</div>
		</div>
		<div v-else>
			<h3>{{ t('Synchronization active') }}</h3>
			<div class="smallerLine">
				<strong>{{ t('Synchronization ID') }}</strong>
			</div>
			<div class="smallerLine">
				<SyncModalQR :code="syncKey" />
			</div>
			<div class="smallerLine poster-text">
				{{ t('Scan QR code or copy ID and paste it in other device') }}
			</div>
			<div class="flex smallerLine">
				<input class="input isFull" type="text" v-model="syncKey" required readonly @click="copyID">
				<BButton icon="fa-regular fa-copy" basicIcon :title="t('Copy ID')" @click="copyID" />
			</div>
			<div class="settingsDivider baseLine"></div>
			<div class="baseLine">{{ t('Last sync') }}: <strong>{{ formatDate(syncTS) }}</strong></div>
			<div>{{ t('Synced since') }}: <strong>{{ formatDate(syncAdded) }}</strong></div>
			<div class="settingsDivider baseLine"></div>
			<BButton full dark class="baseLine" @click="sync.resetSync()">{{ t('Cancel synchronization') }}</BButton>
		</div>
	</div>

	<BModal v-model:open="QRScannerModal" wider class="trailer-modal" @beforeClose="destroyCamera">
		<video ref="videoEl" @loadedmetadata="onLoadedMetadata" class="trailer"></video>
	</BModal>
</template>