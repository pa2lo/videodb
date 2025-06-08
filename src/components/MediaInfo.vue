<script setup>
import { onBeforeUnmount } from 'vue'

import { t } from '@/labels'

import BButton from './BButton.vue'

import { lang, downloadHistory, favItems, currentPage, currentItemInfo } from '@/store'

const DEFAULT_POSTER = import.meta.env.VITE_DEFAULT_POSTER

const props = defineProps({
	isSupportedOs: Boolean,
	showArrows: Boolean,
	isGeneratorSubpage: Boolean
})

const emit = defineEmits(['findNextMedia', 'removeFromDownloadHistory', 'showDownload', 'visitLink', 'searchPerson', 'toggleFav', 'showMovieDBSite', 'showTrailer'])

let eventsAdded = false
let start = {
	x: null,
	y: null,
	id: null,
	time: null
}

function onTouchStart(e) {
	if (window.visualViewport.scale > 1.01 || !props.showArrows) return

	start = {
		x: e.changedTouches[0]?.clientX,
		y: e.changedTouches[0]?.clientY,
		id: e.changedTouches[0]?.identifier,
		time: Date.now()
	}

	eventsAdded = true
	document.addEventListener('touchend', onTouchEnd, { once: true })
}

function onTouchEnd(e) {
	eventsAdded = false
	if (window.visualViewport.scale > 1.01 || ( e.changedTouches[0]?.identifier != start.id) || (Date.now() - start.time > 5000)) return
	const { clientX: endX, clientY: endY } = e.changedTouches[0]

	const diffX = endX - start.x,
		diffY = endY - start.y,
		absX = Math.abs(diffX),
		absY = Math.abs(diffY)

	if (absX > absY && absX > 80 && absY < 100) emit('findNextMedia', diffX < 0)
}

onBeforeUnmount(() => {
	if (eventsAdded) document.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
	<div @touchstart="onTouchStart">
		<div v-if="currentItemInfo.i18n_art[lang].fanart" class="movieInfo-fanart-cont">
			<img :src="currentItemInfo.i18n_art[lang].fanart" class="movieInfo-fanart" />
		</div>
		<div class="movieInfo-topButtons flex ai-c">
			<slot></slot>
			<BButton v-if="favItems.some(fav => fav.id == currentItemInfo.id)" dark icon="fa-solid fa-heart" :title="t('Remove from favorites')" @click="$emit('toggleFav')" />
			<BButton v-else dark icon="fa-regular fa-heart" :title="t('Add to favorites')" @click="$emit('toggleFav')" :disabled="isGeneratorSubpage" />
			<BButton v-if="currentItemInfo.url && downloadHistory.includes(currentItemInfo.url.split('?')[0])" dark icon="fa-solid fa-check" :title="t('Remove from watch list')" @click="$emit('removeFromDownloadHistory', currentItemInfo.url.split('?')[0])" />
			<BButton v-else-if="currentPage?.data?.system?.setContent == 'seasons' && currentItemInfo?.url && downloadHistory.some(hitem => hitem.includes(`/Play/${currentItemInfo?.id}/${currentItemInfo?.info?.season}/`))" dark icon="fa-solid fa-check" :title="t('Remove from watch list')" disabled />
			<BButton v-else-if="currentPage?.data?.system?.setContent != 'seasons' && currentItemInfo?.type == 'dir' && currentItemInfo.url && downloadHistory.some(hitem => hitem.includes(`/Play/${currentItemInfo?.id}/`))" dark icon="fa-solid fa-check" :title="t('Remove from watch list')" disabled />
			<BButton v-if="showArrows" class="ml-a" dark icon="fa-solid fa-chevron-left" :disabled="currentItemInfo?.isFirst" :title="t('Previous video')" @click="$emit('findNextMedia', false)" />
			<BButton v-if="showArrows" dark icon="fa-solid fa-chevron-right" :disabled="currentItemInfo?.isLast" :title="t('Next video')" @click="$emit('findNextMedia', true)" />
		</div>
		<div class="movieInfo-posterCont">
			<img v-if="currentItemInfo.i18n_art[lang]?.poster && !currentItemInfo.i18n_art[lang]?.poster.endsWith('.gif')" :src="currentItemInfo.i18n_art[lang].poster" class="movieInfo-poster" />
			<img v-else :src="DEFAULT_POSTER" class="movieInfo-poster" />
			<div v-if="currentItemInfo.info.rating" class="movieInfo-rating" :class="{isAverage: currentItemInfo.info.rating < 7.5 && currentItemInfo.info.rating > 4, isBad: currentItemInfo.info.rating <= 4}">{{ currentItemInfo.info.rating }}</div>
			<div v-if="currentItemInfo.info.mpaa" class="movieInfo-mpaa">{{ currentItemInfo.info.mpaa }}</div>
		</div>
		<h2 v-if="currentPage?.data?.system?.setContent == 'episodes'" class="movieInfo-title">{{ String(currentItemInfo.info.season || 0).padStart(2, 0) }}x{{ String(currentItemInfo.info.episode).padStart(2, 0) }} - {{ currentItemInfo.i18n_info[lang].epname }}</h2>
		<h2 v-else class="movieInfo-title">{{ currentItemInfo.i18n_info[lang].otitle }}<span v-if="currentPage?.data?.system?.setContent == 'seasons'"> - {{ t('Season') }} {{ String(currentItemInfo.info.season ?? 0).padStart(2, 0) }}</span></h2>
		<div class="movieInfo-meta light">
			<span v-if="currentItemInfo.i18n_info[lang].genre" class="movieInfo-year">{{ currentItemInfo.i18n_info[lang].genre.join(', ') }}</span>
			<span v-if="currentItemInfo.info.year" class="movieInfo-year">{{ currentItemInfo.info.year }}</span>
			<span v-if="currentItemInfo.stream_info.langs" class="movieInfo-country">{{ Object.keys(currentItemInfo.stream_info.langs).slice(0, 3).join(', ') }}</span>
			<span v-if="currentItemInfo.i18n_info[lang].country" class="movieInfo-country">{{ currentItemInfo.i18n_info[lang].country.join(', ') }}</span>
			<span v-if="currentItemInfo.stream_info.video.duration" class="movieInfo-year">{{ currentItemInfo.stream_info.video.duration > 3600 ? new Date(currentItemInfo.stream_info.video.duration * 1000).toISOString().substring(11, 19) : new Date(currentItemInfo.stream_info.video.duration * 1000).toISOString().substring(14, 19) }}</span>
		</div>
		<div v-if="currentItemInfo.i18n_info[lang].plot" class="movieInfo-plot">{{ currentItemInfo.i18n_info[lang].plot }}</div>
		<div v-if="currentItemInfo.info?.director?.length || currentItemInfo.cast?.length" class="movieInfo-cast">
			<div v-if="currentItemInfo.info?.director?.length">
				<span class="light">{{ t('Director') }}: </span>
				<template v-for="(director, index) in currentItemInfo.info?.director">
					<template v-if="index < 4">
						<span class="asLink" @click="$emit('searchPerson', director, currentItemInfo.info?.mediatype == 'tvshow')">{{ director }}</span>
						<template v-if="index+1 < currentItemInfo.info.director.length">
							<template v-if="index < 3">, </template>
							<template v-else>...</template>
						</template>
					</template>
				</template>
			</div>
			<div v-if="currentItemInfo.cast?.length">
				<span class="light">{{ t('Stars') }}: </span>
				<template v-for="(star, index) in currentItemInfo.cast">
					<template v-if="index < 6">
						<span class="asLink" :title="star.role" @click="$emit('searchPerson', star.name, currentItemInfo.info?.mediatype == 'tvshow')">{{ star.name }}</span>
						<template v-if="index+1 < currentItemInfo.cast.length">
							<template v-if="index < 5">, </template>
							<template v-else>...</template>
						</template>
					</template>
				</template>
			</div>
		</div>
		<div class="movieInfo-buttons">
			<BButton v-if="currentItemInfo.type != 'dir'" class="buttonSticky" :icon="isSupportedOs ? 'fa-solid fa-play' : 'fa-solid fa-download'" @click="$emit('showDownload', currentItemInfo)">{{ t(isSupportedOs ? 'Play' : 'Download') }}</BButton>
			<BButton v-else-if="currentItemInfo.type == 'dir'" class="buttonSticky" icon="fa-regular fa-folder-open" @click="$emit('visitLink', currentItemInfo)">{{ t('Open') }}</BButton>
			<div v-if="currentItemInfo.unique_ids.csfd || currentItemInfo.unique_ids.imdb || currentItemInfo.info.trailer" class="movieInfo-buttonsInner">
				<BButton v-if="currentItemInfo.unique_ids.csfd" dark @click.prevent="$emit('showMovieDBSite', 'csfd', currentItemInfo.unique_ids.csfd)">CSFD</BButton>
				<BButton v-if="currentItemInfo.unique_ids.imdb" dark @click.prevent="$emit('showMovieDBSite', 'imdb', currentItemInfo.unique_ids.imdb)">IMDB</BButton>
				<BButton v-if="currentItemInfo.info.trailer" dark @click.prevent="$emit('showTrailer', currentItemInfo.info.trailer)">Trailer</BButton>
			</div>
		</div>
	</div>
</template>