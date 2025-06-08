<script setup>
import { ref, onMounted } from 'vue'

import BButton from './BButton.vue'

import { lang, getQueryParams, downloadHistory, favItems, widgetsMap, currentItemInfo, ignoreMouseEvents } from '@/store'
import { fixRating, getProxyData } from '@/helpers'

const PLUGIN_URL = import.meta.env.VITE_PLUGIN_URL
const DEFAULT_POSTER = import.meta.env.VITE_DEFAULT_POSTER

const props = defineProps({
	id: String,
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
	if (['wm-last', 'ws-last', 'favs'].includes(props.id)) {
		let list = []

		if (props.id == 'favs') list = props.favsFilter ? favItems.value.filter(fav => fav.type == props.favsFilter).map(f => f.id) : favItems.value.map(f => f.id)
		if (['wm-last', 'ws-last'].includes(props.id)) list = downloadHistory.value.filter(i => props.id == 'wm-last' ? i.split('/').length == 3 : i.split('/').length != 3).reverse().map(i => i.split('/')[2]).filter((v, i, a) => a.indexOf(v) == i)

		if (!list.length) return

		if (list.length > 30) list.length = 30

		loading.value = true

		const page = await getProxyData(`${PLUGIN_URL}/Last?${getQueryParams()}`, null, new URLSearchParams({ids: `[${list}]`}).toString(), () => {
			loading.value = true
		})

		if (page?.menu?.length) {
			fixRating(page.menu)
			content.value = page
		}

		if (loading.value == true) loading.value = false
		return
	}

	const wMapItem = widgetsMap[props.id]
	const url = `${PLUGIN_URL}${wMapItem.fetchUrl}${wMapItem.fetchUrl.includes('?') ? '&' : '?'}${getQueryParams()}`
	const page = await getProxyData(url, null, null, () => {
		loading.value = true
	})

	page.menu.length = 30

	if (page.menu?.length) fixRating(page.menu)

	content.value = page
	if (loading.value == true) loading.value = false
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
			<div v-else-if="content" class="posters-contOuter" :class="grid ? 'posters-contOuter-grid' : 'posters-contOuter-slider'">
				<div class="posters-cont" :class="[grid ? 'postersGrid' : 'postersSlider scroller isHorizontal isFocusable' ,{isCurrent: !grid && currentItemInfo?.hoverId?.startsWith(id)}]" @itementer="scrollerItemEnter" ref="scrollerEl" @scroll="onScrollerScroll">
					<template v-for="(link, linkIndex) in content.menu">
						<div
							v-if="link.type != 'next'"
							class="poster"
							:class="[
								grid ? 'isFocusable' : 'isFocusableLR',
								{
									isCurrentLR: !grid && currentItemInfo?.hoverId == `${id}-${link?.id}`,
									isCurrent: grid && currentItemInfo?.hoverId == `${id}-${link?.id}`
								}
							]"
							@click="$emit('showDownload', link)"
							@pointerenter="!ignoreMouseEvents && $emit('setCurrentItemInfo', getLinkData(link, linkIndex))"
							@itementer="$emit('setCurrentItemInfo', getLinkData(link, linkIndex), true)"
						>
							<div class="poster-imgCont">
								<img v-if="(link?.i18n_art?.[lang]?.poster && !link?.i18n_art?.[lang]?.poster?.endsWith('.gif')) || link?.poster" :src="link?.i18n_art?.[lang]?.poster || link?.poster" class="poster-img" loading="lazy" />
								<img v-else :src="DEFAULT_POSTER" class="poster-img" loading="lazy" />
								<div v-if="link?.info?.rating" class="movieInfo-rating" :class="{isAverage: link?.info?.rating < 7.5 && link?.info?.rating > 4, isBad: link?.info?.	rating <= 4}">{{ link?.info?.rating }}</div>
								<BButton class="posterButton-info" icon="fa-solid fa-info" @click.stop="$emit('showCurrentItemInfo', link)" />
								<template v-if="id != 'favs' && link?.url">
									<i v-if="link.id && favItems.some(fav => fav.id == link.id)" class="poster-loved fa-solid fa-heart"></i>
								</template>
								<template v-if="id == 'favs' && link?.url">
									<i v-if="link?.type == 'video' && downloadHistory.includes(link.url)" class="poster-viewed fa-solid fa-check"></i>
									<i v-else-if="link?.type == 'dir' && downloadHistory.some(hitem => hitem.includes(`/Play/${link?.id}/`))" class="poster-viewed fa-solid fa-check"></i>
								</template>
							</div>
							<div class="poster-text">
								<div class="poster-title">{{ link.i18n_info?.[lang]?.otitle || link.title }} <span v-if="link?.info?.year">({{ link.info.year }})</span> <span v-if="link?.stream_info?.langs">{{ Object.keys(link.stream_info.langs).slice(0, 2).join(', ') }}</span></div>
								<div v-if="link?.i18n_info?.[lang]?.genre" class="poster-genres">{{ link?.i18n_info?.[lang]?.genre.slice(0, 2).join(', ') }}</div>
							</div>
						</div>
					</template>
				</div>
				<template v-if="!grid">
					<BButton class="scroller-arrow scroller-arrow-left" dark icon="fa-solid fa-chevron-left" :class="{isInvisible: !hasLeftArrow}" @click="scrollerEl.scrollLeft -= scrollerEl.clientWidth * 0.8" />
					<BButton class="scroller-arrow scroller-arrow-right" dark icon="fa-solid fa-chevron-right" :class="{isInvisible: !hasRightArrow}" @click="scrollerEl.scrollLeft += scrollerEl.clientWidth * 0.8" />
				</template>
			</div>
		</Transition>
	</div>
</template>