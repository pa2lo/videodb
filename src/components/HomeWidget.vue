<script setup>
import { ref, onMounted } from 'vue'

import BButton from './BButton.vue'

import { lang, downloadHistory, favs, seriesHistory, moviesHistory, widgetsCache, widgetsMap, currentItemInfo } from '@/store'

const PLUGIN_URL = import.meta.env.VITE_PLUGIN_URL

const props = defineProps({
	id: String,
	queryParam: String,
	grid: Boolean,
	favsFilter: String
})

const content = ref(null)
const loading = ref(false)
const scrollerEl = ref(null)
const widgetEl = ref(null)

const hasLeftArrow = ref(false)
const hasRightArrow = ref(false)

onMounted(async () => {
	if (props.id == 'favs') {
		content.value = {
			menu: props.favsFilter ? favs.value.filter(fav => fav.type == props.favsFilter) : JSON.parse(JSON.stringify(favs.value))
		}
		return
	}

	if (['wm-last', 'ws-last'].includes(props.id)) {
		content.value = {
			menu: props.id == 'ws-last' ? JSON.parse(JSON.stringify(seriesHistory.value)) : JSON.parse(JSON.stringify(moviesHistory.value))
		}
		return
	}

	let ts = Date.now()

	if (widgetsCache.value[props.id] && (ts - widgetsCache.value[props.id].ts < 1800000)) {
		content.value = widgetsCache.value[props.id].data
	} else {
		loading.value = true

		const response = await fetch(`${PLUGIN_URL}${widgetsMap[props.id]?.fetchUrl}&${props.queryParam}`)
		const page = await response.json()

		let l = page.menu?.length || 1

		page.menu?.map((item, index, arr) => {
			if (item.info?.rating && item.info.rating > 0 && item.info.rating < 1) item.info.rating = parseFloat((item.info.rating * 10).toFixed(2))
		})

		widgetsCache.value[props.id] = {
			data: page,
			ts
		}

		loading.value = false
		content.value = page
	}
})

function onPostersEnter() {
	onScrollerScroll()
	scrollOnInit()
}

function scrollOnInit() {
	let currentEl = widgetEl.value?.querySelector('.isCurrentLR')
	if (!currentEl) return

	if (typeof document.documentElement.scrollIntoViewIfNeeded == 'function') currentEl.scrollIntoViewIfNeeded(true)
}

function scrollerItemEnter() {
	const contScroller = widgetEl.value.closest('.scroller')

	const scrollerBottom = widgetEl.value.offsetTop + widgetEl.value.clientHeight

	if (contScroller.scrollTop + contScroller.clientHeight < scrollerBottom || contScroller.scrollTop > widgetEl.value.offsetTop) {
		widgetEl.value.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		})
	}

	let firstItem = widgetEl.value.querySelector('.isFocusableLR')
	if (firstItem) firstItem.dispatchEvent(new Event('itementer'))
}

function onScrollerScroll() {
	if (props.grid || !scrollerEl.value) return

	hasLeftArrow.value = scrollerEl.value.scrollLeft > 0
	hasRightArrow.value = scrollerEl.value.scrollLeft + scrollerEl.value.clientWidth + 2 < scrollerEl.value.scrollWidth
}

function getLinkData(link, index) {
	return {
		...link,
		hoverId: `${props.id}-${link?.id}`,
		isFirst: index == 0,
		isLast: index == content.value.menu.length-1 || (index == content.value.menu.length-2 && content.value.menu[index+1].type == 'next')
	}
}
</script>

<template>
	<div v-if="loading || content?.menu?.length" class="hpWidget" ref="widgetEl">
		<h3 class="hpWidget-title">{{ widgetsMap[id]?.sectionTitle[lang] }}</h3>
		<Transition appear name="layout" mode="out-in" @enter="onPostersEnter">
			<div v-if="loading" class="hpWidget-loader"><i class="fa-solid fa-spinner fa-spin-pulse fa-4x"></i></div>
			<div v-else-if="content" class="posters-contOuter">
				<div class="posters-cont scroller isHorizontal isFocusable" :class="[grid ? 'postersGrid' : 'postersSlider' ,{isCurrent: currentItemInfo?.hoverId?.startsWith(id)}]" @itementer="scrollerItemEnter" ref="scrollerEl" @scroll="onScrollerScroll">
					<template v-for="(link, linkIndex) in content.menu">
						<div
							v-if="link.type != 'next'"
							class="poster isFocusableLR"
							:class="{isCurrentLR: currentItemInfo?.hoverId == `${id}-${link?.id}`}"
							@click="$emit('showDownload', link)"
							@pointerenter="$emit('setCurrentItemInfo', getLinkData(link, linkIndex))"
							@itementer="$emit('setCurrentItemInfo', getLinkData(link, linkIndex), true)"
						>
							<div class="poster-imgCont">
								<img v-if="link?.i18n_art?.[lang]?.poster || link?.poster" :src="link?.i18n_art?.[lang]?.poster || link?.poster" class="poster-img" loading="lazy" />
								<div v-if="link?.info?.rating" class="movieInfo-rating" :class="{isAverage: link?.info?.rating < 7.5 && link?.info?.rating > 4, isBad: link?.info?.	rating <= 4}">{{ link?.info?.rating }}</div>
								<BButton class="posterButton-info" icon="fa-solid fa-info" @click.stop="$emit('showCurrentItemInfo')" />
								<template v-if="!['ws-last', 'wm-last', 'favs'].includes(id) && link?.url">
									<i v-if="link.id && favs.some(fav => fav.id == link.id)" class="poster-loved fa-solid fa-heart"></i>
									<i v-if="link?.type == 'video' && downloadHistory.includes(link.url)" class="poster-viewed fa-regular fa-eye"></i>
									<i v-else-if="link?.type == 'dir' && downloadHistory.some(hitem => hitem.includes(`/Play/${link?.id}/`))" class="poster-viewed fa-regular fa-eye"></i>
								</template>
							</div>
							<div class="poster-text">
								<div class="poster-title">{{ link.i18n_info?.[lang]?.otitle || link.title }} <span v-if="link?.info?.year">({{ link.info.year }})</span> <span v-if="link?.stream_info?.langs">{{ Object.keys(link.stream_info.langs).slice(0, 2).join(', ') }}</span></div>
								<div v-if="link?.i18n_info?.[lang]?.genre" class="poster-genres">{{ link?.i18n_info?.[lang]?.genre.slice(0, 2).join(', ') }}</div>
							</div>
						</div>
					</template>
				</div>
				<BButton class="scroller-arrow scroller-arrow-left" dark icon="fa-solid fa-chevron-left" :class="{isInvisible: !hasLeftArrow}" @click="scrollerEl.scrollLeft -= scrollerEl.clientWidth * 0.8" />
				<BButton class="scroller-arrow scroller-arrow-right" dark icon="fa-solid fa-chevron-right" :class="{isInvisible: !hasRightArrow}" @click="scrollerEl.scrollLeft += scrollerEl.clientWidth * 0.8" />
			</div>
		</Transition>
	</div>
</template>