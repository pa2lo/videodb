<script setup>
import { t } from '@/labels'

import { gCastAvailable, copyLinkButton } from '@/store'

import BButton from './BButton.vue'

defineProps({
	isSupportedOs: Boolean,
	isDesktopOs: Boolean,
	current: Boolean,
	link: [Object, Boolean],
	loading: Boolean
})
</script>

<template>
	<div class="downloadModal-link flex ai-c" :class="{isCurrent: current, isLoading: loading}" @click="$emit('downloadFile', link, isSupportedOs)">
		<div class="downloadModal-linkTitle flex ai-c">
			<i class="fa-solid" :class="!loading ? isSupportedOs ? 'fa-play' : 'fa-download' : 'fa-spinner fa-spin-pulse'"></i>
			<span class="downloadModal-linkTitle-text">
				<slot />
			</span>
		</div>
		<div class="downloadModal-linkButtons">
			<BButton v-if="gCastAvailable" basicIcon smaller icon="fa-brands fa-chromecast" :title="t('Stream video')" @click.stop="$emit('downloadFile', link, false, false, true)" :disabled="loading" />
			<BButton v-if="isSupportedOs" basicIcon smaller icon="fa-solid fa-download" :title="t('Download')" @click.stop="$emit('downloadFile', link)" :disabled="loading" />
			<BButton v-if="copyLinkButton" class="copyLink" basicIcon smaller icon="fa-regular fa-copy" :title="t('Copy link')" @click.stop="$emit('copyFileLink', link)" :disabled="loading" />
			<BButton v-if="isDesktopOs" basicIcon smaller icon="fa-solid fa-plus" :title="t('Add to playlist')" @click.stop="$emit('downloadFile', link, true, true)" :disabled="loading" />
		</div>
	</div>
</template>