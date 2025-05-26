<script setup>
import { ref, shallowReactive, onBeforeMount, onBeforeUnmount, computed, watch, nextTick } from 'vue'

import { fixRating, reformatString, slugify } from './helpers'
import { t } from './labels'

import BButton from './components/BButton.vue'
import BModal from './components/BModal.vue'
import HomeWidget from './components/HomeWidget.vue'
import MediaInfo from './components/MediaInfo.vue'
import HelpModalContent from './components/HelpModalContent.vue'
import AppSettings from './components/AppSettings.vue'
import DownloadLink from './components/DownloadLink.vue'
import SyncModalContent from './components/SyncModalContent.vue'

import { lang, listsort, streamsLang, token, downloadToken, tokenDate, uid, downloadHistory, favItems, generatorShows, generatorQuality, generatorShowsHistory, bookmarks, theme, hpWidgets, winPlayer, androidPlayer, iosPlayer, widgetsMap, currentPage, currentItemInfo, toasts, showToast, destroyToast, showsMap, searchIdMap, genresMap, homepageLinks, moviesAdditionalLinks, ignoreMouseEvents, getQueryParams, syncKey, syncError, syncing, gCastAvailable, gCastConnected } from './store'
import { getProxyData, abortSignalAny } from './helpers'
import { sync } from './sync'
import { gCast } from './gCast'

const PLUGIN_URL = import.meta.env.VITE_PLUGIN_URL
const SERVICE_URL = import.meta.env.VITE_SERVICE_URL
const SITE_URL = import.meta.env.VITE_SITE_URL
const DOWNLOAD_SERVICE_URL = import.meta.env.VITE_DOWNLOAD_SERVICE_URL

// OS
const isMac = navigator?.platform == 'MacIntel' && navigator.maxTouchPoints < 2
const isAndroid = /android/i.test(navigator.userAgent)
const isIOS = /iPad|iPhone|iPod/.test(navigator?.platform || navigator?.userAgentData?.platform) || (navigator?.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const isWindows = !isMac && !isAndroid && /win32|win64|windows/i.test(navigator?.platform || navigator?.userAgentData?.platform)
const isSafari = /Apple/i.test(navigator.vendor) && /Safari/i.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches

const isSupportedOs = isMac || isAndroid || isIOS || isWindows
const isDesktopOs = isMac || isWindows

// vars
const languages = ['sk', 'cs', 'en']

const customHistory = ref([])

const appState = shallowReactive({
	loading: false,
	isLogging: false,
	loginError: '',
	krUser: '',
	krPass: '',
	krRemember: false,
	videoUrl: '',
	autoLogin: false
})

const downloadStreams = shallowReactive({
	show: false,
	loading: true,
	link: null,
	data: null,
	error: '',
	current: null,
	loadingLink: ''
})

const searchData = shallowReactive({
	show: false,
	type: null,
	model: '',
	error: '',
	genreSearchShow: false,
	genreType: 'FMovies',
	genre: 1,
	genreOrder: 'rating',
	genreRating: 60,
	genreYear: 2010,
	genreDub: 1
})

const generatorShowsData = shallowReactive({
	loading: false,
	show: null,
	epname: null,
	epUrl: null,
	url: null
})

const csfdFrame = shallowReactive({
	show: false,
	src: null
})

const trailerData = shallowReactive({
	show: false,
	src: null
})

// element refs
const searchInputEl = ref(null)
const mainEl = ref(null)
const videoEl = ref(null)

// modals
const showSettingsModal = ref(false)
const showInfoModal = ref(false)
const showHelpModal = ref(false)
const showCurrentSortModal = ref(false)
const showSyncModal = ref(false)

// install
const installPromptCancelled = ref(localStorage.getItem('installClosed'))
const installPrompt = ref(null)
const iOsInstallPrompt = isIOS && isSafari && !isStandalone
const iOsInstallHelper = ref(false)
const showInstallPrompt = ref(iOsInstallPrompt || false)

function installApp(e) {
	if (e == true) showInstallPrompt.value = false
	if (iOsInstallPrompt) return iOsInstallHelper.value = true
	if (!installPrompt.value) return
	installPrompt.value.prompt()
	installPrompt.value.userChoice.then(result => {
		if (result.outcome === 'accepted') installPrompt.value = null
	})
}
function closeInstallNotification() {
	installPromptCancelled.value = 1
	localStorage.setItem('installClosed', 1)
}

// custom history
const windowHistory = window.history
let historyCallback = null
function pushToHistory() {
	customHistory.value.push({
		page: JSON.parse(JSON.stringify(currentPage.value))
	})
	let fullTitle = currentPage.value?.title?.[lang.value]
	if ((currentPage.value?.data?.filter?.page && currentPage.value?.data?.filter?.page != 1) || (currentPage.value?.data?.system?.setContent == 'episodes' && customHistory.value.at(currentHistoryIndex.value - 1)?.page?.data?.system?.setContent == 'seasons')) fullTitle = `${breadCrumbs.value.findLast(b => b.isInvisible == false)?.title[lang.value]} - ${currentPage.value?.title?.[lang.value]}`
	if (!isStandalone) fullTitle += ' - VideoDB'
	windowHistory.pushState({id: currentPage.value?.id, url: currentPage.value?.url, title: fullTitle}, '', `#${slugify(currentPage.value?.title?.[lang.value] || currentPage.value?.id)}`)
	document.title = fullTitle
}
function onPopState(e) {
	if (historyCallback) {
		customHistory.value.splice(1, 100)
		currentPage.value = {type: 'visitFromHistory'}
		historyCallback()
		return historyCallback = null
	}

	if (windowHistory.state == null && customHistory.value.length) return setHistoryContent(0)
	if (!windowHistory.state?.id) return

	let newIndex = customHistory.value.findIndex(hitem => hitem.page.id == windowHistory.state.id && hitem.page.url == windowHistory.state.url)
	if (newIndex > -1) {
		setHistoryContent(newIndex)
		document.title = windowHistory.state.title || 'VideoDB'
	}
}

// sort
function setCurrentSortBy(by) {
	currentPage.value.sortBy = by
	showCurrentSortModal.value = false
}
const sortFunctions = {
	rating: (a, b) => (b?.info?.rating ?? 0) - (a?.info?.rating ?? 0),
	newest: (a, b) => (b?.info?.year ?? 0) - (a?.info?.year ?? 0),
	oldest: (a, b) => (a?.info?.year ?? 2100) - (b?.info?.year ?? 2100),
	longest: (a, b) => (b?.info?.duration ?? 0) - (a?.info?.duration ?? 0),
	shortest: (a, b) => (a?.info?.duration ?? Number.MAX_SAFE_INTEGER) - (b?.info?.duration ?? Number.MAX_SAFE_INTEGER)
}
const sortedList = computed(() => {
	let items = currentPage.value?.data?.menu || []

	const sortBy = currentPage.value?.sortBy || listsort.value
	if (sortBy && sortFunctions[sortBy]) items = items.toSorted(sortFunctions[sortBy])

	return items.map((item, index, arr) => {
		if (index === 0) item.isFirst = true
		if ((index === arr.length - 1 && item?.type !== 'next') || (index === arr.length - 2 && arr[index + 1]?.type === 'next')) item.isLast = true
		return item
	})
})

// bookmarks
const isInBookmarks = computed(() => {
	return currentPage.value?.url && bookmarks.value.some(bookmark => currentPage.value.url.startsWith(bookmark.url))
})
function toggleBookmark() {
	if (!currentPage.value?.url) return
	if (bookmarks.value.some(bookmark => currentPage.value?.url?.startsWith(bookmark.url))) {
		bookmarks.value = bookmarks.value.filter(bookmark => !currentPage.value?.url?.startsWith(bookmark.url))
		showToast(t('Page removed from bookmarks'), 'check')
	} else if (currentPage.value?.data?.filter?.page && currentPage.value?.data?.filter?.page != 1) {
		let bookmarkItem = customHistory.value.findLast(hitem => hitem?.page?.data?.filter?.page == 1)
		if (!bookmarkItem) return
		bookmarks.value.push({
			url: bookmarkItem.page.url,
			title: bookmarkItem.page.title
		})
		showToast(t('Page added to bookmarks'), 'check')
	} else if (currentPage.value?.data?.system?.setContent == 'episodes') {
		let lastSeason = customHistory.value.findLast(hitem => hitem.page?.data?.system?.setContent == 'seasons')
		if (lastSeason) {
			bookmarks.value.push({
				url: lastSeason.page.url,
				title: lastSeason.page.title
			})
		} else {
			bookmarks.value.push({
				url: currentPage.value.url,
				title: currentPage.value.title
			})
		}
		showToast(t('Series added to bookmarks'), 'check')
	} else {
		bookmarks.value.push({
			url: currentPage.value.url,
			title: currentPage.value.title
		})
		showToast(t('Page added to bookmarks'), 'check')
	}
	sync.update('bookmarks')
}

// favs
function toggleFav() {
	if (!currentItemInfo.value?.id || isNaN(currentItemInfo.value.id)) return

	if (favItems.value.some(fav => fav?.id == currentItemInfo.value.id)) {
		let existingFav = favItems.value.find(fav => fav.id == currentItemInfo.value.id)
		favItems.value = favItems.value.filter(fav => fav != existingFav)
		showToast(t(existingFav.type == 'dir' ? 'Show removed from favorites' : 'Video removed from favorites'), 'check')
	} else {
		let data = {
			id: currentItemInfo.value.id,
			type: ['episodes', 'seasons'].includes(currentPage.value?.data?.system?.setContent) ? 'dir' : currentItemInfo.value.type
		}

		favItems.value.unshift(data)

		showToast(t(data.type == 'dir' ? 'Show added to favorites' : 'Video added to favorites'), 'check')
	}
	sync.update('favs')
}

// pages content
const currentHistoryIndex = computed(() => {
	if (customHistory.value.length < 1 || !currentPage.value) return -1

	return customHistory.value.findIndex(hitem => hitem?.page?.id == currentPage.value?.id && hitem.page?.ts == currentPage.value?.ts) || 0
})
const currentHistoryIndexDiff = computed(() => {
	return customHistory.value.length - currentHistoryIndex.value - 1
})
const breadCrumbs = computed(() => {
	if (customHistory.value.length < 1) return []

	return customHistory.value.filter((v, i) => currentHistoryIndex.value > -1 ? i < currentHistoryIndex.value : true).reduce((acc, item, currentIndex, arr) => {
		let isInvisible = (item.page.data?.filter?.page && item.page.data?.filter?.page != 1) && !['seasons', 'episodes'].includes(customHistory.value[currentIndex+1]?.page?.data?.system?.setContent) || false

		acc.push({
			isHome: currentIndex == 0,
			title: item.page.title,
			id: item.page.id,
			url: item.page.url,
			isInvisible: isInvisible
		})
		return acc
	}, [])
})
const isGeneratorSubpage = computed(() => {
	return currentHistoryIndex.value > 0 && customHistory.value?.[1]?.page?.id == 'generator'
})
function getFilterFromTo() {
	if (!currentPage.value?.data?.filter) return ''

	if (currentPage.value.data.filter.page == 1 && currentPage.value.data.filter.limit >= currentPage.value.data.filter.meta.total_found) return currentPage.value.data.filter.meta.total_found

	let from = currentPage.value.data.filter.page == 1 ? 1 : (parseInt(currentPage.value.data.filter.page) - 1) * parseInt(currentPage.value.data.filter.limit)
	let to = parseInt(currentPage.value.data.filter.limit) * parseInt(currentPage.value.data.filter.page)
	let total = parseInt(currentPage.value.data.filter.meta.total_found)
	if (total < to) to = total

	return `${from}-${to} / ${total}`
}
function setHistoryContent(index) {
	if (!customHistory.value.length) return
	if (showInfoModal.value) showInfoModal.value = false
	if (downloadStreams.show) downloadStreams.show = false
	if (showCurrentSortModal.value) showCurrentSortModal.value = false
	if (searchData.genreSearchShow) searchData.genreSearchShow = false
	if (searchData.show) searchData.show = false
	if (trailerData.show) trailerData.show = false
	if (csfdFrame.show) csfdFrame.show = false

	appState.loading = true

	currentPage.value = customHistory.value[index].page
	currentItemInfo.value = customHistory.value[index].selected

	appState.loading = false
}

let homePageInit = false
async function getHomePage(reload, loadSync) {
	appState.loading = true

	if (loadSync) await sync.onInit()

	requestAnimationFrame(() => {
		currentPage.value = {
			data: homepageLinks,
			id: 'home',
			title: reduceStringByLangs('Home', ''),
			type: 'home'
		}

		if (!customHistory.value[0]) {
			customHistory.value = [{
				page: JSON.parse(JSON.stringify(currentPage.value))
			}]
		}
		if (!homePageInit) {
			window.addEventListener('popstate', onPopState)
			homePageInit = true
		}

		appState.loading = false
	})
}

async function getUrlContent(url, customUrl) {
	let destination = customUrl ? customUrl : url
	if (!destination?.startsWith(PLUGIN_URL)) destination = url?.includes('&uid=') ? `${PLUGIN_URL}${url}` : `${PLUGIN_URL}${url}${url.includes('?') ? '&' : '?'}${getQueryParams()}`

	const page = await getProxyData(destination)

	if (!page?.menu?.length) {
		appState.loading = false
		showToast(t('The folder is empty'))
		return false
	} else if (page?.menu) {
		fixRating(page.menu)

		if (page.system?.setContent === 'movies') page.menu = page.menu.filter((item, index, arr) => arr.findIndex(x => (x.id || x.url) === (item.id || item.url)) === index)

		if (url == '/FMovies') page?.menu?.push(...moviesAdditionalLinks)
	}

	currentItemInfo.value = null

	return page
}
async function refreshPage() {
	if (currentHistoryIndex.value == 0) return window.location.reload()

	if (!currentPage.value.url || appState.loading) return

	appState.loading = true

	try {
		const page = await getUrlContent(currentPage.value.url)
		if (!page) return

		currentPage.value.data = page
	} catch (error) {
		reportFetchError(error)
	} finally {
		appState.loading = false
	}
}
async function visitLink(link, url) {
	if (link?.action == 'csearch') return showSearch(true, link.id)
	if (link?.action == 'generator') return showGeneratorPage()

	if (link?.url && currentItemInfo.value?.url != link.url) setCurrentItemInfo(link)
	if (ignoreMouseEnter || appState.loading) return

	if (showInfoModal.value) showInfoModal.value = false

	appState.loading = true

	try {
		const page = await getUrlContent(link?.url, url)
		if (!page) {
			if (currentPage.value?.type == 'visitFromHistory') setHistoryContent(0)
			return
		}

		if (currentHistoryIndex.value > -1) customHistory.value.splice(currentHistoryIndex.value+1, 100)

		currentPage.value = {
			...getLinkData(link, url),
			data: page,
			title: getLinkTitle(link),
			ts: Date.now()
		}

		pushToHistory()
	} catch (error) {
		reportFetchError(error)
	} finally {
		appState.loading = false
	}
}
function visitLinkFromHome(link, url) {
	if (currentHistoryIndex.value > 0) {
		if (link?.url && link?.url == currentPage?.value?.url) return refreshPage()
		if (link?.url && customHistory.value.some(hitem => hitem?.page?.url == link?.url)) return windowHistory.go(customHistory.value.findIndex(hitem => hitem?.page?.url == link?.url)+1 - customHistory.value.length + currentHistoryIndexDiff.value)

		historyCallback = () => visitLink(link, url)
		return windowHistory.go(-currentHistoryIndex.value)
	}
	visitLink(link, url)
}
function reportFetchError(error) {
	showToast(t(error?.name == 'TimeoutError' ? 'Request timeout' : 'Error loading data'))
	console.log(error)
}

// download
async function getShortenedLink(link) {
	try {
		let res = await fetch(`${DOWNLOAD_SERVICE_URL}/shorten.php`, {
			method: 'POST',
			body: new URLSearchParams({link})
		})
		let resJSON = await res.json()

		if (resJSON.success && resJSON.id) return `${SITE_URL}/server/r/${resJSON.id}`
		return link
	} catch (error) {
		console.log(error)
		return link
	}
}
async function showDownload(link) {
	if (link?.url && currentItemInfo.value?.url != link.url) setCurrentItemInfo(link)
	if (ignoreMouseEnter) return

	if (link.type == 'next' || link.type == 'dir') return visitLink(link)

	Object.assign(downloadStreams, {
		loading: true,
		link: link.url,
		data: null,
		error: '',
		current: null,
		show: true,
		loadingLink: ''
	})

	try {
		const data = await getProxyData(`${PLUGIN_URL}/${link.url}${link.url.includes('?') ? '&' : '?'}${getQueryParams()}`)

		downloadStreams.data = data
		downloadStreams.loading = false
	} catch (error) {
		showToast(t('Error loading data'))
		downloadStreams.show = false
		console.log(error)
	}
}
async function downloadFile(stream, playLink, enqueue, castToDevice) {
	if (downloadStreams.show) {
		if (downloadStreams.loadingLink == stream.url) return

		requestAnimationFrame(() => {
			downloadStreams.error = ''
			downloadStreams.loadingLink = stream.url
		})
	}

	let newLink = await getDownloadLink(stream.url)

	if (newLink && isIOS && iosPlayer.value == 'vlc') newLink = await getShortenedLink(newLink)

	if (!newLink) {
		if (downloadStreams.show) downloadStreams.loadingLink = ''
		return
	}

	if (castToDevice) {
		gCast.stream(newLink)
	} else {
		const alink = document.createElement('a')
		alink.download = stream?.filename || ''
		alink.setAttribute('referrerpolicy', "no-referrer")
		alink.rel = "noopener,noreferrer"
		alink.href = getSystemLink(newLink, playLink, enqueue)
		alink.click()
	}

	if (downloadStreams.show) downloadStreams.loadingLink = ''

	if (downloadStreams.link && downloadHistory.value[downloadHistory.value.length - 1] != downloadStreams.link) {
		if (downloadHistory.value.includes(downloadStreams.link)) downloadHistory.value.splice(downloadHistory.value.indexOf(downloadStreams.link), 1)
		downloadHistory.value.push(downloadStreams.link.split('?')[0])
		sync.update('history')
	}
}
async function copyFileLink(stream) {
	let newLink = await getDownloadLink(stream.url)

	if (!newLink) return

	// safari timeout hack
	setTimeout(() => {
		navigator.clipboard.write([
			new ClipboardItem({	'text/plain': newLink }),
		])
		showToast(t('Link copied to clipboard'), 'check')
	}, 0)
}
function setNextStreamAsCurrent(down) {
	let currentIndex = downloadStreams.data.strms.findIndex(stream => stream.url == downloadStreams.current?.url)
	let nextIndex = down ? (currentIndex + 1) % downloadStreams.data.strms.length : (Math.max(currentIndex, 0) - 1 + downloadStreams.data.strms.length) % downloadStreams.data.strms.length
	downloadStreams.current = downloadStreams.data.strms[nextIndex]

	requestAnimationFrame(() => {
		let currentDownloadLink = document.querySelector('.modal .downloadModal-link.isCurrent')
		if (currentDownloadLink) {
			const { top, bottom } = currentDownloadLink.getBoundingClientRect()

			if (top < 0 || bottom > window.innerHeight) currentDownloadLink.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			})
		}
	})
}

// viewed history
function removeFromDownloadHistory(url) {
	if (!downloadHistory.value.includes(url)) return
	let index = downloadHistory.value.findIndex(h => h == url)
	downloadHistory.value.splice(index, 1)
	sync.update('history')
	showToast(t('Video removed from watch list'), 'check')
}

// search
function showSearch(clear = false, type = null) {
	if (clear === true) searchData.model = ''
	searchData.type = type
	searchData.error = ''
	searchData.show = true
}
function searchPerson(name, isShow) {
	let type = isShow ? 'search-people-series' : 'search-people-movie'

	let newUrl = getSearchUrl(type, name)

	doSearch(reduceStringByLangs('Search', null, (l) => `${searchIdMap[type][l]} - ${name}`), newUrl)
}
function generalSearch(type) {
	if (type == 'by-genre') return searchData.genreSearchShow = true
	if (!searchData.model) return

	let newUrl =  getSearchUrl(type, searchData.model)

	doSearch(reduceStringByLangs('Search', null, (l) => `${searchIdMap[type][l]} - ${searchData.model}`), newUrl)
}
function doSearchByGenre() {
	searchData.genreSearchShow = false

	let newUrl = `${PLUGIN_URL}/${searchData.genreType}/genre/${searchData.genre}?of=${searchData.genreOrder == 'name' ? `name_${lang.value.replace('sk', 'sl')}_seo` : searchData.genreOrder}${searchData.genreRating ? `&r=>${searchData.genreRating}` : ''}${searchData.genreYear ? `&y=>${searchData.genreYear}` : ''}${searchData.genreDub == '1' ? '&dub=1' : ''}&od=${searchData.genreOrder == 'name' ? 'asc' : 'desc'}&lang=${lang.value}&uid=${uid.value}&ver=2.0`

	doSearch(reduceStringByLangs(null, null, (l) => `${t(searchData.genreType == 'FMovies' ? 'Movies' : 'Series', l)} ${searchIdMap['by-genre'][l]} - ${genresMap[searchData.genre][l]}`), newUrl)
}
function doSearch(title, newUrl) {
	const callback = () => visitLink({title}, newUrl)

	if (searchData.show) {
		searchData.show = false
		return visitLinkFromHome({title}, newUrl)
	}

	callback()
}

// Generator
function showGeneratorPage() {
	currentItemInfo.value = null
	currentPage.value = {
		type: 'geneartor',
		id: 'generator',
		title: reduceStringByLangs('Random episode', '')
	}

	customHistory.value.length = 1
	pushToHistory()
}
async function getRandomShowsEpisode(ignoreHistory) {
	if (generatorShowsData.loading && !ignoreHistory) return
	generatorShowsData.loading = true

	if (ignoreHistory != true) pushGeneratorHistoryItem(generatorShowsData)

	const showId = parseInt(generatorShows.value[Math.floor(Math.random() * generatorShows.value.length)])

	let episode

	try {
		const seasonsFetchData = await getProxyData(`${PLUGIN_URL}/FGet/${showId}?${getQueryParams()}`)
		const season = seasonsFetchData.menu[Math.floor(Math.random() * seasonsFetchData.menu.length)]

		const episodesFetchData = await getProxyData(`${PLUGIN_URL}/${season.url}?${getQueryParams()}`)
		episode = episodesFetchData.menu[Math.floor(Math.random() * episodesFetchData.menu.length)]
	} catch (error) {
		showToast(t('Error loading data'))
	}

	if (generatorShowsHistory.value.some(hitem => hitem.epUrl == episode.url)) return getRandomShowsEpisode(true)

	try {
		const streamsFetchData = await getProxyData(`${PLUGIN_URL}/${episode.url}?${getQueryParams()}`)
		streamsFetchData.strms.map(stream => {
			stream.size = stream.size.includes('GB') ? parseFloat(stream.size)*1000 : parseFloat(stream.size)
		})
		streamsFetchData.strms.filter(strm => strm.size > 120)
		streamsFetchData.strms.sort((a, b) => generatorQuality.value == 'high' ? b.size - a.size : a.size - b.size)
		const stream = {
			low: streamsFetchData.strms[0].url,
			high: streamsFetchData.strms.at(-1).url,
			medium: streamsFetchData.strms.some(strm => strm.size < 950 && strm.size > 400) ? streamsFetchData.strms.filter(strm => strm.size > 400)[0].url : streamsFetchData.strms[0].url
		}

		generatorShowsData.show = showId
		generatorShowsData.epname = `${String(episode?.info?.season || 0).padStart(2, 0)}x${String(episode?.info?.episode).padStart(2, 0)} - ${episode?.i18n_info[lang.value]?.epname}`
		generatorShowsData.epUrl = episode.url
		generatorShowsData.url = stream
	} catch (error) {
		showToast(t('Error loading data'))
	}

	generatorShowsData.loading = false
}
function generatorDownloadFile(link, playLink = false, enqueue = false) {
	downloadStreams.link = link.epUrl
	downloadFile({url: link.url[generatorQuality.value]}, playLink, enqueue)
	pushGeneratorHistoryItem(link)
}
function pushGeneratorHistoryItem(link) {
	if (!link.epUrl || generatorShowsHistory.value.some(hItem => hItem.epUrl == link.epUrl)) return
	generatorShowsHistory.value.unshift({
		show: JSON.parse(JSON.stringify(link.show)),
		epname: JSON.parse(JSON.stringify(link.epname)),
		epUrl: JSON.parse(JSON.stringify(link.epUrl)),
		url: JSON.parse(JSON.stringify(link.url))
	})
	generatorShowsHistory.value.splice(20, 5)
}

// list
let ignoreMouseEnter = false
function beforeListLeave() {
	ignoreMouseEnter = true
}
function afterListEnter() {
	ignoreMouseEnter = false
	mainEl.value?.focus()
}
function findNextMedia(right, updateDownloadWindow) {
	let currentEl = getCurrentFocusableItem()
	if (!currentEl || (right && currentItemInfo.value?.isLast) || (!right && currentItemInfo.value?.isFirst)) return

	let next = right ? currentEl.nextElementSibling : currentEl.previousElementSibling
	if (next) {
		next.dispatchEvent(new Event('itementer'))
		if (updateDownloadWindow == true) {
			if (downloadController) downloadController.abort()
			requestAnimationFrame(() => {
				showDownload(currentItemInfo.value)
			})
		}
	}
}
function findNextFocusableItem(down, num = 1, limit = false) {
	let focusableEls = Array.from(mainEl.value.querySelectorAll('.isFocusable'))
	if (!focusableEls.length) return

	let currentIndex = focusableEls.findIndex(el => el.classList.contains('isCurrent'))
	let nextIndex = down ?
		limit ? Math.min(currentIndex + num, focusableEls.length - 1) : (currentIndex + num) % focusableEls.length :
		limit ? Math.max(currentIndex - num, 0) : (Math.max(currentIndex, 0) - num + focusableEls.length) % focusableEls.length

	focusableEls[nextIndex].dispatchEvent(new Event('itementer'))
}
function findEndFocusableItem(home) {
	let focusableEls = Array.from(mainEl.value.querySelectorAll('.isFocusable'))
	if (!focusableEls.length) return

	let nextItem = home ? focusableEls[0] : focusableEls.at(-1)
	if (nextItem) nextItem.dispatchEvent(new Event('itementer'))
}
function mainCurrentClick() {
	let currentEl = getCurrentFocusableItem()
	if (currentEl) currentEl.click()
}
function scrollCurrent(behavior = 'smooth') {
	let el = null
	el = document.querySelector('.scroller .isCurrentLR')
	if (!el) el = document.querySelector('.scroller .isCurrent')
	if (!el) return

	let cont = el.closest('.scroller')

	if (el.classList.contains('isFocusableLR')) {
		const elRightOffset = el.offsetLeft + el.clientWidth

		if (cont.scrollLeft + cont.clientWidth - 80 < elRightOffset || elRightOffset - 160 < cont.scrollLeft) {
			el.scrollIntoView({
				behavior,
				inline: 'center',
				block: 'nearest'
			})
		}
	} else {
		const elBottomOffset = el.offsetTop + el.clientHeight

		if (cont.scrollTop + cont.clientHeight < elBottomOffset || elBottomOffset - 61 < cont.scrollTop) {
			el.scrollIntoView({
				behavior,
				block: 'center'
			})
		}
	}
}

// movie DB Sites
function showMovieDBSite(site, id) {
	if (!site || !id) return
	if (site == 'csfd') {
		csfdFrame.src = `https://www.csfd.${navigator.language.startsWith('sk') ? 'sk' : 'cz'}/film/${id}`
		csfdFrame.show = true
	} else {
		const imdbLink = Object.assign(document.createElement('a'), {
			target: '_blank',
			href: `https://www.imdb.com/title/${id}/`
		})
		imdbLink.click()
	}
}

// trailer
function showTrailer(url) {
	trailerData.src = url
	trailerData.show = true
}
function destroyTrailer() {
	videoEl.value.src = ""
}

// login logout
onBeforeMount(() => {
	runUpdater()

	if (tokenDate.value && (Date.now() - tokenDate.value > 86400000)) {
		logout()
		appState.autoLogin = true
	} else if (token.value) getHomePage(false, true)

	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault()
		if (!installPromptCancelled.value) showInstallPrompt.value = true
		installPrompt.value = e
	})

	// gCast.init(true)
})
onBeforeUnmount(() => {
	if (currentPage.value) window.removeEventListener('popstate', onPopState)
})
function logout() {
	token.value = ''
	tokenDate.value = ''
	downloadToken.value = ''
	customHistory.value.length = 1
}
async function getToken() {
	if (appState.isLogging) return

	appState.isLogging = true
	appState.loginError = ''
	const options = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: `{"data":{"username":"${appState.krUser}","password":"${appState.krPass}"}}`
	}

	fetch(`${SERVICE_URL}/user/login`, options)
		.then(response => response.json())
		.then(async response => {
			if (response.session_id) {
				if (appState.krRemember) saveTokenInfoB()
				else if (localStorage.getItem('tokenInfoB')) localStorage.removeItem('tokenInfoB')

				const newDownloadToken = await getDownloadToken(response.session_id)

				if (newDownloadToken == false) {
					appState.isLogging = false
					appState.loginError = 'Unable to get download token'
				} else {
					appState.isLogging = false
					token.value = response.session_id
					downloadToken.value = newDownloadToken
					tokenDate.value = Date.now()

					getHomePage(false, true)

					appState.krUser = ''
					appState.krPass = ''
					appState.krRemember = false
				}
			} else if (response.msg) {
				appState.isLogging = false
				appState.loginError = response.msg
			}
		})
		.catch(err => console.error(err))
}

function saveTokenInfoB() {
	localStorage.setItem('tokenInfoB', btoa(JSON.stringify({
		usr: appState.krUser,
		pass: appState.krPass
	})))
}
function getLSTokenInfoB() {
	let lsData = localStorage.getItem('tokenInfoB')
	if (!lsData) return

	return JSON.parse(atob(lsData))
}
async function getDownloadToken(session_id) {
	try {
		const fileList = await fetch(`${SERVICE_URL}/file/list`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `{"session_id": "${session_id}","data": {"parent": "","filter": "sc.json"}}`
		})
		const fileListJSON = await fileList.json()

		if (!fileListJSON.data?.[0]?.ident) return false

		const fileDownload = await fetch(`${SERVICE_URL}/file/download`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `{"session_id":"${session_id}","data":{"ident":"${fileListJSON.data[0].ident}"}}`
		})
		const fileDownloadJSON = await fileDownload.json()

		if (!fileDownloadJSON?.data?.link) return false

		const tokenData = await fetch(`${DOWNLOAD_SERVICE_URL}/getTokenContent.php`, {
			method: 'POST',
			body: new URLSearchParams({ url: fileDownloadJSON.data.link })
		})
		const tokenDataTEXT = await tokenData.text()

		if (!tokenDataTEXT) return false

		return tokenDataTEXT
	} catch (error) {
		console.log(error)
		return false
	}
}

async function onInterfaceEnter() {
	if (appState.autoLogin && !token.value) {
		appState.autoLogin = false

		const lsData = getLSTokenInfoB()
		if (!lsData?.usr || !lsData?.pass) return

		appState.krUser = lsData.usr
		appState.krPass = lsData.pass
		appState.krRemember = true

		getToken()
	}
}

// video info
function setCurrentItemInfo(link, scrollToItem) {
	if (ignoreMouseEnter) return
	if (!link) currentItemInfo.value = null
	else currentItemInfo.value = link

	if (currentHistoryIndex.value > -1 && customHistory.value[currentHistoryIndex.value]) customHistory.value[currentHistoryIndex.value].selected = JSON.parse(JSON.stringify(currentItemInfo.value))

	if (scrollToItem) {
		requestAnimationFrame(() => {
			scrollCurrent()
		})
	}
}
function showCurrentItemInfo() {
	if (['next', 'back'].includes(currentItemInfo.value?.type) || !currentItemInfo.value?.info || showInfoModal.value || !currentItemInfo.value?.i18n_art || ignoreMouseEnter) return
	showInfoModal.value = true
}

// helpers
function runUpdater() {
	// Update 05/25
	if (localStorage.getItem('seriesHistory')) localStorage.removeItem('seriesHistory')
	if (localStorage.getItem('moviesHistory')) localStorage.removeItem('moviesHistory')
	if (localStorage.getItem('dubOnly')) localStorage.removeItem('dubOnly')
	if (localStorage.getItem('favs')) {
		favItems.value = JSON.parse(localStorage.getItem('favs')).map(({id, type}) => ({ id, type }))
		localStorage.removeItem('favs')
	}
	if (localStorage.getItem('onlyDub')) {
		streamsLang.value = 0
		localStorage.removeItem('onlyDub')
	}
}
function getCurrentFocusableItem() {
	return mainEl.value.querySelector('.isCurrentLR') || mainEl.value.querySelector('.isCurrent')
}
let downloadController = null
async function getDownloadLink(url) {
	try {
		if (downloadController) {
			downloadController.abort()
			await nextTick()
		}

		downloadController = new AbortController()

		const id = await getProxyData(`${PLUGIN_URL}/${url}?${getQueryParams()}`, downloadController.signal)

		if (!id?.ident) {
			downloadStreams.error = t('Error loading ID')
			return false
		}

		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `{"session_id":"${token.value}","data":{"ident":"${id.ident}"}}`,
			signal: abortSignalAny([downloadController.signal, AbortSignal.timeout(10000)])
		}

		const response2 = await fetch(`${SERVICE_URL}/file/download`, options)
		const res = await response2.json()
		if (!res?.data?.link) {
			downloadStreams.error = t('Error loading URL')
			if (response2.status == 401) logout()
			return false
		}

		return res.data.link
	} catch (error) {
		if (error?.name == 'TimeoutError') downloadStreams.show ? downloadStreams.error = t('Request timeout') : showToast(t('Request timeout'))
		else if (error?.name != 'AbortError') {
			console.log(error)
			showToast(t('Error loading data'))
		}
		return null
	} finally {
		if (downloadController) downloadController = null
	}
}
function reduceStringByLangs(string, param, callback) {
	return languages.reduce((arr, l) => {
		arr[l] = `${string ? `${t(string, l)} ` : ''}${callback ? callback(l) : param}`
		return arr
	}, {})
}
function getLinkTitle(link) {
	if (link?.type == 'next' && link?.filter?.page > 1) return reduceStringByLangs('Page', link.filter.page)
	if (currentPage.value?.data?.system?.setContent == 'seasons') return reduceStringByLangs('Season', link.info.season)
	if (!link?.i18n_info?.sk && !link?.title) return currentPage.value.title
	else if (!link.i18n_info?.sk && link.title) return reduceStringByLangs(null, null, (l) => link.title?.[l] || link.title)
	return reduceStringByLangs(null, null, (l) => link?.i18n_info?.[l]?.otitle || link?.i18n_info?.[l]?.title)
}
function getSystemLink(url, playLink, enqueue) {
	if (!playLink) return url

	if (isMac) return `iina://weblink?url=${encodeURI(url)}${enqueue ? '&enqueue=1' : ''}`
	else if (isAndroid && androidPlayer.value == 'mpv') return `intent://${url.replace('https://', '')}#Intent;type=video/any;package=is.xyz.mpv;scheme=https;end;`
	else if (isAndroid && androidPlayer.value == 'vlc') return `vlc://${url.replace('https://', '')}`
	else if (isIOS && iosPlayer.value == 'vlc') return `vlc-x-callback://x-callback-url/stream?url=${encodeURI(url)}`
	else if (isIOS && iosPlayer.value == 'vlc2') return `vlc://${encodeURI(url.replace('https://', ''))}`
	else if (isIOS && iosPlayer.value == 'nplayer') return `nplayer-${encodeURI(url)}`
	else if (isWindows && winPlayer.value == 'pot') return `potplayer://${encodeURI(url)}${enqueue ? ' /add' : ''}`
	else if (isWindows && winPlayer.value == 'vlc') return `${enqueue ? 'vlcenqueue' : 'vlcplay'}://${url}`
}
function getLinkData(link, url) {
	if (link.cast) link.cast.slice(0, 7)
	if (link?.info?.director) link.info.director.slice(0, 6)
	if (!link.id) link.id = Date.now()
	link.url = url ? url : link?.url || null
	return link
}
function getSearchUrl(type, value) {
	return `${PLUGIN_URL}/Search/${type}?gen=1&id=${type}&ms=1&search=${value.replace(' ', '+')}&${getQueryParams()}`
}

// main key events
function onInfoKeydown(e) {
	if (e.code == 'KeyC' && !e.metaKey && !e.ctrlKey) showMovieDBSite('csfd', currentItemInfo.value?.unique_ids?.csfd)
	else if (e.code == 'KeyM') showMovieDBSite('imdb', currentItemInfo.value?.unique_ids?.imdb)
	else if (e.code == 'KeyW') removeFromDownloadHistory(currentItemInfo.value?.url)
	else if (e.code == 'KeyF') toggleFav()
	else if (e.code == 'ArrowRight' || e.code == 'ArrowLeft') findNextMedia(e.code == 'ArrowRight')
	else if (e.key == 'Enter') showDownload(currentItemInfo.value)
}
function onMainKeydown(e) {
	if (e.code == 'Escape' && currentHistoryIndex.value > -1) windowHistory.go(-currentHistoryIndex.value)
	else if (currentPage?.value?.type == 'geneartor') {
		if (e.code == 'KeyD') generatorDownloadFile(generatorShowsData)
		else if (e.code == 'KeyP' && !e.metaKey && !e.ctrlKey && isSupportedOs) generatorDownloadFile(generatorShowsData, true)
		else if (e.code == 'KeyQ' && isDesktopOs) generatorDownloadFile(generatorShowsData, true, true)
		else if (e.code == 'KeyC' && !e.metaKey && !e.ctrlKey && isDesktopOs) copyFileLink({url: generatorShowsData.url[generatorQuality.value]})
		else if (e.code == 'KeyF') getRandomShowsEpisode(false)
		else if (e.key == 'Enter') getRandomShowsEpisode(false)
	} else {
		if (e.code == 'KeyI') showCurrentItemInfo()
		else if (e.code == 'KeyB' && !e.metaKey && !e.ctrlKey) toggleBookmark()
		else if (e.code == 'KeyC' && !e.metaKey && !e.ctrlKey) showMovieDBSite('csfd', currentItemInfo.value?.unique_ids?.csfd)
		else if (e.code == 'KeyM') showMovieDBSite('imdb', currentItemInfo.value?.unique_ids?.imdb)
		else if (e.code == 'KeyW') removeFromDownloadHistory(currentItemInfo.value?.url)
		else if (e.code == 'KeyF') toggleFav()
		else if (e.key == 'Enter') mainCurrentClick()
		else if (e.code == 'ArrowDown' || e.code == 'ArrowUp') findNextFocusableItem(e.code == 'ArrowDown')
		else if (e.code == 'ArrowRight' || e.code == 'ArrowLeft') findNextMedia(e.code == 'ArrowRight')
		else if (e.code == 'PageDown' || e.code == 'PageUp') findNextFocusableItem(e.code == 'PageDown', 10, true)
		else if (e.code == 'Home' || e.code == 'End') findEndFocusableItem(e.code == 'Home')
	}
}
function onDownloadModalKeydown(e) {
	if (downloadStreams.data?.strms?.length && (e.code == 'ArrowDown' || e.code == 'ArrowUp')) {
		e.preventDefault()
		setNextStreamAsCurrent(e.code == 'ArrowDown')
	} else if (currentPage.value?.data?.system?.setContent == 'episodes' && (e.code == 'ArrowRight' || e.code == 'ArrowLeft')) findNextMedia(e.code == 'ArrowRight', true)
	else if (e.code == 'KeyW') removeFromDownloadHistory(currentItemInfo.value?.url)
	else if (downloadStreams.current) {
		if (e.key == 'Enter') downloadFile(downloadStreams.current, isSupportedOs)
		else if (e.code == 'KeyQ' && isDesktopOs) downloadFile(downloadStreams.current, true, true)
		else if (e.code == 'KeyP' && !e.metaKey && !e.ctrlKey && isSupportedOs) downloadFile(downloadStreams.current, true)
		else if (e.code == 'KeyD') downloadFile(downloadStreams.current)
		else if (e.code == 'KeyC' && !e.metaKey && !e.ctrlKey) copyFileLink(downloadStreams.current)
	}
}
function startIgnoringEvents(e) {
	if (e.key == 'Shift') return
	ignoreMouseEvents.value = true
}

// theme
watch(theme, () => {
	if (theme.value == 'light') document.querySelector('meta[name="theme-color"]').setAttribute('content', 'hsl(193, 40%, 92%)');
	else if (theme.value == 'dark') document.querySelector('meta[name="theme-color"]').setAttribute('content', 'hsl(193, 40%, 10%)');
	else document.querySelector('meta[name="theme-color"]').setAttribute('content', window.matchMedia('(prefers-color-scheme: light)').matches ? 'hsl(193, 40%, 92%)' : 'hsl(193, 40%, 10%)');
	document.documentElement.classList.toggle('theme-dark', theme.value == 'dark')
	document.documentElement.classList.toggle('theme-light', theme.value == 'light')
})

// after import
function afterImport() {
	showSyncModal.value = false
	showSettingsModal.value = false
	if (currentHistoryIndex.value > 0) windowHistory.go(-currentHistoryIndexDiff.value)
	else getHomePage(true)
}
</script>

<template>
	<Transition appear name="layout" mode="out-in" @afterEnter="onInterfaceEnter">
		<div v-if="token" class="layout" @keydown="startIgnoringEvents" @mousemove="ignoreMouseEvents && (ignoreMouseEvents = false)">
			<header class="flex ai-c header" :tabindex="isIOS ? '-1' : null">
				<a class="logo" href="/" @click.prevent="currentHistoryIndex > 0 ? windowHistory.go(-currentHistoryIndex) : getHomePage(true)">
					<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="#2ebc4f"><path d="M 0 18 C 0 0, 0 0, 18 0 S 36 0, 36 18, 36 36 18 36, 0 36, 0 18" transform="rotate(0, 18, 18) translate(0, 0)"></path></svg>
					<i class="fa-solid fa-circle-play"></i>
				</a>
				<div class="desktopNav flex">
					<div class="desktopNav-link" :class="{isActive: currentPage?.url?.startsWith('/FMovies') || currentPage?.data?.system?.setContent == 'movies'}" @click.prevent="visitLinkFromHome(homepageLinks.menu[0])">
						<i class="fa-solid fa-video desktopNav-icon"></i>
						<div class="desktopNav-title">{{ t('Movies') }}</div>
					</div>
					<div class="desktopNav-link" :class="{isActive: !isGeneratorSubpage && (currentPage?.url?.startsWith('/FSeries') || ['seasons', 'episodes', 'tvshows'].includes(currentPage?.data?.system?.setContent))}" @click.prevent="visitLinkFromHome(homepageLinks.menu[1])">
						<i class="fa-solid fa-tv desktopNav-icon"></i>
						<div class="desktopNav-title">{{ t('Series') }}</div>
					</div>
					<div class="desktopNav-link" :class="{isActive: isGeneratorSubpage}" @click.prevent="visitLinkFromHome({action: 'generator'})">
						<i class="fa-solid fa-shuffle desktopNav-icon"></i>
						<div class="desktopNav-title">{{ t('Random') }}</div>
					</div>
				</div>
				<div class="pageTitle flex ai-c">
					<BButton dark smaller icon="fa-solid fa-angle-left" class="buttonUnstyled" :disabled="currentPage?.type == 'home'" @click.prevent="windowHistory.go(-1)" :title="t('Back')" />
					<Transition name="layout" mode="out-in">
						<div v-if="currentPage" class="pageTitle-textCont flex" :key="currentPage.ts || currentPage.id">
							<div v-if="breadCrumbs.length" class="pageTitle-bc">
								<template v-for="(bcLink, index) in breadCrumbs">
									<span v-if="!bcLink.isInvisible && index > 0">
										<a href="#" @click.prevent="windowHistory.go(index+1 - customHistory.length + currentHistoryIndexDiff)">
											<span v-html="reformatString(bcLink.title[lang])"></span>
										</a>
										<span class="bcLink-spacer">></span>
									</span>
								</template>
							</div>
							<div v-if="(currentPage.data?.filter?.page && currentPage.data?.filter?.page != 1) || (currentPage.data?.system?.setContent == 'episodes' && customHistory.at(currentHistoryIndex - 1)?.page?.data?.system?.setContent == 'seasons')" class="pageTitle-textPre">{{ breadCrumbs.findLast(b => b.isInvisible == false)?.title[lang] }} -&nbsp;</div>
							<div class="pageTitle-text" v-html="reformatString(currentPage?.title?.[lang] || '')"></div>
							<div v-if="['movies', 'tvshows'].includes(currentPage?.data?.system?.setContent)" class="pageTitle-info">
								<template v-if="currentPage?.data?.filter?.meta?.total_found">{{ getFilterFromTo() }}</template>
								<template v-else-if="sortedList.length">{{ sortedList.length }}</template>
							</div>
							<div v-else-if="['episodes', 'seasons'].includes(currentPage?.data?.system?.setContent) && currentPage?.data?.filter && currentPage?.data?.filter?.meta?.total_found" class="pageTitle-info">{{ currentPage.data.filter.meta.total_found }}</div>
						</div>
					</Transition>
				</div>
				<div class="header-buttons-outer flex">
					<BButton dark smaller icon="fa-solid fa-ellipsis-vertical" class="header-more buttonUnstyled" :title="t('Menu')" @click="$event.target.closest('button')?.focus()" @focus="null" />
					<div class="header-buttons flex ai-c">
						<BButton dark smaller class="buttonUnstyled" :class="{isSorted: currentPage?.sortBy}" icon="fa-solid fa-arrow-down-short-wide" :disabled="!['movies', 'tvshows'].includes(currentPage?.data?.system?.setContent)" @click.prevent="showCurrentSortModal = true" :title="t('List sort')" />
						<BButton dark smaller class="buttonUnstyled" :icon="isInBookmarks ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'" :disabled="!currentPage?.url" @click.prevent="toggleBookmark" :title="isInBookmarks ? t('Remove from bookmarks') : t('Add to bookmarks')" />
						<!-- <BButton dark smaller class="buttonUnstyled" icon="fa-solid fa-rotate-right" @click.prevent="refreshPage" :title="t('Refresh page')" /> -->
						<BButton dark smaller class="buttonUnstyled" icon="fa-solid fa-search" :title="t('Search')" @click="showSearch" />
						<BButton v-if="gCastConnected" dark smaller class="buttonUnstyled isSorted" icon="fa-brands fa-chromecast" :title="t('Disconnect device')" @click="disconnectGCast" />
						<BButton v-if="installPrompt || iOsInstallPrompt" class="buttonUnstyled" dark smaller icon="fa-solid fa-cloud-arrow-down" :title="t('Download App')" @click.prevent="installApp" />
						<BButton dark smaller class="buttonUnstyled" :class="{isSorted: syncKey && !syncError, isError: syncKey && syncError}" :icon="`fa-solid fa-arrows-rotate ${syncing ? 'fa-spin' : ''}`" :title="t('Synchronization')" @click.prevent="showSyncModal = true" />
						<BButton dark smaller class="buttonUnstyled" icon="fa-solid fa-gear" :title="t('Settings')" @click.prevent="showSettingsModal = true" />
						<BButton dark smaller class="buttonUnstyled" icon="fa-solid fa-question" :title="t('Help')" @click.prevent="showHelpModal = true" />
						<BButton dark smaller class="buttonUnstyled" icon="fa-solid fa-right-from-bracket" :title="t('Logout')" @click.prevent="logout" />
					</div>
				</div>
			</header>
			<main class="main" tabindex="1" ref="mainEl" @keydown="onMainKeydown" @keydown.prevent.delete="windowHistory.go(-1)">
				<Transition appear name="layout" mode="out-in" @enter="scrollCurrent('instant')" @afterEnter="afterListEnter" @beforeLeave="beforeListLeave">
					<div v-if="appState.loading" class="loader" key="loader">
						<i class="fa-solid fa-spinner fa-spin-pulse fa-5x"></i>
					</div>
					<div v-else-if="currentPage?.data?.system?.setContent == 'files'" class="dirPage scroller" :key="currentPage.id">
						<div class="dirLinks">
							<div v-if="currentPage?.type != 'home'" class="dirLink isFocusable" :class="{isCurrent: currentItemInfo && currentItemInfo.type == 'back'}" @click.prevent="windowHistory.go(-1)" @pointerenter="!ignoreMouseEvents && setCurrentItemInfo({type: 'back'})" @itementer="setCurrentItemInfo({type: 'back'}, true)">
								<div class="dirLink-title"><i class="fa-solid fa-angle-left fa-fw"></i> {{ t('Back') }}</div>
							</div>
							<template v-for="link in currentPage?.data.menu">
								<div v-if="(link.type == 'dir' || link?.action == 'csearch' || link?.action == 'generator') && link?.url != 'failed'" class="dirLink isFocusable" :class="{isCurrent: currentItemInfo && ((currentItemInfo.url && currentItemInfo.url == link.url) || (currentItemInfo.id && currentItemInfo.id == link.id))}" @click.prevent="visitLink(link)" @pointerenter="!ignoreMouseEvents && setCurrentItemInfo(link)" @itementer="setCurrentItemInfo(link, true)">
									<div class="dirLink-title" v-html="link.i18n_info ? reformatString(link.i18n_info[lang]?.title) : reformatString(link.title)"></div>
								</div>
							</template>
						</div>
						<div v-if="currentPage?.type == 'home' && bookmarks.length" class="dirLinks divided">
							<template v-for="link in bookmarks">
								<div class="dirLink isFocusable" :class="{isCurrent: currentItemInfo && ((currentItemInfo.url && currentItemInfo.url == link.url) || (currentItemInfo.id && currentItemInfo.id == link.id))}" @click.prevent="visitLink(link)" @pointerenter="!ignoreMouseEvents && setCurrentItemInfo(link)" @itementer="setCurrentItemInfo(link, true)">
									<div class="dirLink-title" v-html="reformatString(link.title[lang])"></div>
								</div>
							</template>
						</div>
						<div v-if="currentPage?.type == 'home' && hpWidgets.length" class="homeWidgets">
							<template v-for="(val, key) in widgetsMap">
								<HomeWidget
									v-if="hpWidgets.includes(key)"
									:id="key"
									@showDownload="showDownload"
									@setCurrentItemInfo="setCurrentItemInfo"
									@removeFromDownloadHistory="removeFromDownloadHistory"
									@visitLink="visitLink"
									@showCurrentItemInfo="showCurrentItemInfo"
								/>
							</template>
						</div>
						<div v-else-if="currentPage?.url == '/FMovies'" class="homeWidgets">
							<HomeWidget
								id="wm-last"
								:grid="!favItems.some(fav => fav.type == 'video')"
								@showDownload="showDownload"
								@setCurrentItemInfo="setCurrentItemInfo"
								@removeFromDownloadHistory="removeFromDownloadHistory"
								@visitLink="visitLink"
								@showCurrentItemInfo="showCurrentItemInfo"
							/>
							<HomeWidget
								id="favs"
								grid
								favsFilter="video"
								@showDownload="showDownload"
								@setCurrentItemInfo="setCurrentItemInfo"
								@removeFromDownloadHistory="removeFromDownloadHistory"
								@visitLink="visitLink"
								@showCurrentItemInfo="showCurrentItemInfo"
							/>
						</div>
						<div v-else-if="currentPage?.url == '/FSeries'" class="homeWidgets">
							<HomeWidget
								id="ws-last"
								:grid="!favItems.some(fav => fav.type == 'dir')"
								@showDownload="showDownload"
								@setCurrentItemInfo="setCurrentItemInfo"
								@removeFromDownloadHistory="removeFromDownloadHistory"
								@visitLink="visitLink"
								@showCurrentItemInfo="showCurrentItemInfo"
							/>
							<HomeWidget
								id="favs"
								grid
								favsFilter="dir"
								@showDownload="showDownload"
								@setCurrentItemInfo="setCurrentItemInfo"
								@removeFromDownloadHistory="removeFromDownloadHistory"
								@visitLink="visitLink"
								@showCurrentItemInfo="showCurrentItemInfo"
							/>
						</div>
					</div>
					<div v-else-if="['movies', 'tvshows', 'episodes', 'seasons'].includes(currentPage?.data?.system?.setContent)" class="moviesPage" :key="`i-${currentPage.ts}`">
						<div class="movieLinks scroller">
							<div v-if="customHistory.length" class="movieLink isFocusable movieLink-back" :class="{isCurrent: currentItemInfo && currentItemInfo.type == 'back'}" @click.prevent="windowHistory.go(-1)" @pointerenter="!ignoreMouseEvents && setCurrentItemInfo({type: 'back'})" @itementer="setCurrentItemInfo({type: 'back'}, true)">
								<div class="movieLink-title"><i class="fa-solid fa-angle-left fa-fw"></i> {{ t('Back') }}</div>
							</div>
							<template v-for="link in sortedList">
								<div v-if="!link.action" class="movieLink isFocusable flex ai-c" :class="{isCurrent: currentItemInfo && currentItemInfo.url == link.url}" @click="showDownload(link)" @pointerenter="!ignoreMouseEvents && setCurrentItemInfo(link)" @itementer="setCurrentItemInfo(link, true)">
									<span class="movieLink-title" v-html="reformatString(link.i18n_info[lang].title)"></span>
									<i v-if="link?.type == 'video' && link?.url && downloadHistory.includes(link.url.split('?')[0])" class="fa-solid fa-check"></i>
									<i v-else-if="currentPage?.data?.system?.setContent == 'seasons' && link?.url && downloadHistory.some(hitem => hitem.includes(`/Play/${link?.id}/${link?.info?.season}/`))" class="fa-solid fa-check"></i>
									<i v-else-if="currentPage?.data?.system?.setContent != 'seasons' && link?.type == 'dir' && link.url && downloadHistory.some(hitem => hitem.includes(`/Play/${link?.id}/`))" class="fa-solid fa-check"></i>
									<i v-if="link.id && ['movies', 'tvshows'].includes(currentPage?.data?.system?.setContent) && favItems.some(fav => fav.id == link.id)" class="fa-solid fa-heart"></i>
									<span v-if="link?.info?.rating" class="movieLink-rating" :class="{isAverage: link?.info?.rating < 7.5 && link?.info?.rating > 4, isBad: link?.info?.rating <= 4}"></span>
									<div class="movieLink-mobileLi movieLink-mobileLi-mobile" v-if="link.type != 'next'" @click.stop="showCurrentItemInfo">
										<i class="fa-solid fa-info"></i>
									</div>
									<div class="movieLink-mobileLi movieLink-mobileLi-tabled" v-if="link.type != 'next'" @click.stop="false">
										<i class="fa-solid fa-info"></i>
									</div>
								</div>
							</template>
						</div>
						<div class="movieInfo">
							<Transition name="layout" mode="out-in">
								<MediaInfo
									v-if="currentItemInfo && !['next', 'back'].includes(currentItemInfo.type)"
									class="movieInfo-cont"
									showArrows
									:isGeneratorSubpage
									:isSupportedOs
									@showDownload="showDownload"
									@visitLink="visitLink"
									@removeFromDownloadHistory="removeFromDownloadHistory"
									@findNextMedia="findNextMedia"
									@searchPerson="searchPerson"
									@toggleFav="toggleFav"
									@showMovieDBSite="showMovieDBSite"
									@showTrailer="showTrailer"
								 />
							</Transition>
						</div>
					</div>
					<div v-else-if="currentPage?.type == 'geneartor'" class="dirPage scroller">
						<div class="generatorSection">
							<BButton :icon="generatorShowsData.loading ? 'fa-solid fa-spinner fa-spin-pulse' : 'fa-solid fa-shuffle'" :disabled="!generatorShows.length || generatorShowsData.loading" @click.stop="getRandomShowsEpisode">{{ t('Find next episode') }}</BButton>
							<Transition name="layout" mode="out-in">
								<div v-if="generatorShowsData.loading" class="generatorSection-loading line">
									<i class="fa-solid fa-spinner fa-spin-pulse fa-5x"></i>
								</div>
								<div v-else-if="generatorShowsData.epname" class="generatorSection-info line">
									<h3 class="generatorSetcion-episode">
										<a href="#" @click.prevent="visitLink({url: `/FGet/${generatorShowsData.show}`, id: generatorShowsData.show, title: showsMap[generatorShowsData.show]})">{{ showsMap[generatorShowsData.show] }}</a> - {{ generatorShowsData.epname }}
									</h3>
									<div class="line buttons flex ai-c jc-c">
										<BButton v-if="isSupportedOs" icon="fa-solid fa-play" @click.stop="generatorDownloadFile(generatorShowsData, true)">{{ t('Play') }}</BButton>
										<BButton icon="fa-solid fa-download" @click.stop="generatorDownloadFile(generatorShowsData)">{{ t('Download') }}</BButton>
										<BButton v-if="isDesktopOs" icon="fa-solid fa-plus" @click.stop="generatorDownloadFile(generatorShowsData, true, true)">{{ t('Add to playlist') }}</BButton>
									</div>
								</div>
							</Transition>
							<Transition name="layout" mode="out-in">
								<div v-if="generatorShowsHistory.length" class="generatorSection divided">
									<h3>{{ t('Last generated') }}</h3>
									<div class="generatorSetcion-historyItems line">
										<DownloadLink v-for="historyItem in generatorShowsHistory" class="isHoverable" :link="historyItem" :isSupportedOs :isDesktopOs  @downloadFile="generatorDownloadFile" @copyFileLink="(link) => copyFileLink({url: link.url[generatorQuality]})">
											<span class="asLink" @click.stop="visitLink({url: `/FGet/${historyItem.show}`, title: showsMap[historyItem.show]})">{{ showsMap[historyItem.show] }}</span> - {{ historyItem.epname }}
										</DownloadLink>
									</div>
								</div>
							</Transition>
						</div>
						<div class="dirLinks divided dirLinks-shows">
							<label v-for="(showName, showId) in showsMap" class="dirLink isHoverable" :class="{isInactive: !generatorShows.includes(showId)}">
								<input class="sr-only" type="checkbox" v-model="generatorShows" :value="showId" />
								<img :src="`/img/shows/${showId}.png`" :alt="showName" class="dirLink-img" />
							</label>
						</div>
					</div>
				</Transition>
			</main>
			<aside class="mobileNav flex">
				<div class="mobileNav-link" :class="{isActive: currentPage?.id == 'home'}" @click.prevent="currentHistoryIndex > 0 ? windowHistory.go(-currentHistoryIndex) : getHomePage(true)">
					<i class="fa-solid fa-home mobileNav-icon"></i>
					<div class="mobileNav-title">{{ t('Home') }}</div>
				</div>
				<div class="mobileNav-link" :class="{isActive: currentPage?.url?.startsWith('/FMovies') || currentPage?.data?.system?.setContent == 'movies'}" @click.prevent="visitLinkFromHome(homepageLinks.menu[0])">
					<i class="fa-solid fa-video mobileNav-icon"></i>
					<div class="mobileNav-title">{{ t('Movies') }}</div>
				</div>
				<div class="mobileNav-link" :class="{isActive: !isGeneratorSubpage && (currentPage?.url?.startsWith('/FSeries') || ['seasons', 'episodes'].includes(currentPage?.data?.system?.setContent))}" @click.prevent="visitLinkFromHome(homepageLinks.menu[1])">
					<i class="fa-solid fa-tv mobileNav-icon"></i>
					<div class="mobileNav-title">{{ t('Series') }}</div>
				</div>
				<div class="mobileNav-link" :class="{isActive: isGeneratorSubpage}" @click.prevent="visitLinkFromHome({action: 'generator'})">
					<i class="fa-solid fa-shuffle mobileNav-icon"></i>
					<div class="mobileNav-title">{{ t('Random') }}</div>
				</div>
				<div class="mobileNav-link" @click.prevent="showSearch">
					<i class="fa-solid fa-magnifying-glass mobileNav-icon"></i>
					<div class="mobileNav-title">{{ t('Search') }}</div>
				</div>
			</aside>
			<Transition name="maxHeight" appear>
				<div v-if="!installPromptCancelled && showInstallPrompt" class="installNotification flex">
					<i class="fa-solid fa-cloud-arrow-down fa-3x installNotification-icon"></i>
					<div class="installNotification-text">
						<h3>{{ t('Download App') }}</h3>
						<div class="smallerLine" v-html="t('Do you want to download <strong>VideoDB</strong> as app to your device?')"></div>
					</div>
					<div class="buttons flex ai-c">
						<BButton icon="fa-solid fa-cloud-arrow-down" @click="installApp(true)">{{ t('Download') }}</BButton>
						<BButton outline @click="closeInstallNotification()">{{ t('Cancel') }}</BButton>
					</div>
				</div>
			</Transition>
			<BModal v-model:open="searchData.show" narrow :title="searchData.type ? `${t('Search')} ${searchIdMap[searchData.type]?.[lang]}` : t('Search')">
				<form class="searchCont">
					<label class="blockLabel line">
						<input ref="searchInputEl" class="input autofocus isFull" :placeholder="t('Search text...')" v-model="searchData.model" required />
					</label>
					<div class="line">
						<template v-for="(option, key) in searchIdMap">
							<BButton
								v-if="!searchData.type || searchData.type == key"
								:icon="key != 'by-genre' ? 'fa-solid fa-magnifying-glass' : null"
								:dark="key == 'by-genre'"
								class="smallerLine"
								full
								:type="key == 'search-movie' || searchData?.type == key ? 'submit' : 'button'"
								@click.prevent="generalSearch(key)"
								:disabled="key != 'by-genre' && !searchData.model"
							>
								<span class="searchOption">{{ searchData.type ? t('Search') : option[lang] }}</span>
							</BButton>
						</template>
					</div>
				</form>
			</BModal>
			<BModal v-model:open="showInfoModal" wider :title="t('Video information')" @keydown="onInfoKeydown" @swipeX="findNextMedia">
				<div class="modal-movieInfo-arrows">
					<BButton class="buttonLeft" dark icon="fa-solid fa-chevron-left" :disabled="currentItemInfo?.isFirst" :title="t('Previous video')" @click="findNextMedia(false)" />
					<BButton class="buttonRight" dark icon="fa-solid fa-chevron-right" :disabled="currentItemInfo?.isLast" :title="t('Next video')" @click="findNextMedia(true)" />
				</div>
				<MediaInfo
					v-if="currentItemInfo && !['next', 'back'].includes(currentItemInfo.type)"
					class="modal-movieInfo-cont"
					:isGeneratorSubpage
					:isSupportedOs
					@showDownload="showDownload"
					@visitLink="visitLink"
					@removeFromDownloadHistory="removeFromDownloadHistory"
					@findNextMedia="findNextMedia"
					@searchPerson="searchPerson"
					@toggleFav="toggleFav"
					@showMovieDBSite="showMovieDBSite"
					@showTrailer="showTrailer"
				/>
				<div v-else class="searchCont">{{ t('No informations') }}</div>
			</BModal>
			<BModal v-model:open="downloadStreams.show" :title="t('Select stream')" @keydown="onDownloadModalKeydown">
				<template #buttons>
					<BButton v-if="downloadStreams.link && downloadHistory.includes(downloadStreams.link.split('?')[0])" class="modal-button" icon="fa-solid fa-check" :title="t('Remove from watch list')" @click="removeFromDownloadHistory(downloadStreams.link.split('?')[0])" />
				</template>
				<Transition name="maxHeight">
					<div v-if="downloadStreams.error" class="loginBox-error modal-error">
						{{ downloadStreams.error }}
					</div>
				</Transition>
				<div v-if="downloadStreams.loading" class="modal-loader"><i class="fa-solid fa-spinner fa-spin-pulse fa-3x"></i></div>
				<div v-else>
					<DownloadLink v-for="streamLink in downloadStreams.data.strms" :loading="downloadStreams.loadingLink == streamLink.url" class="isFocusable" :link="streamLink" :isSupportedOs :isDesktopOs :current="downloadStreams.current?.url == streamLink.url" @downloadFile="downloadFile" @copyFileLink="copyFileLink" @pointerenter="!ignoreMouseEvents && (downloadStreams.current = streamLink)">
						<strong>{{ streamLink.size }}</strong> - {{ streamLink.quality }} <span class="light"><span class="downloadModal-streamInfoPC">{{ streamLink.vinfo }}{{ streamLink.ainfo }}</span><span class="downloadModal-streamInfoMobile">{{ streamLink.linfo?.join(', ').toUpperCase() }}</span></span>
					</DownloadLink>
					<div class="downloadModal-episodeInfo flex ai-c">
						<div class="downloadModal-episodeTitle">
							<template v-if="currentPage?.data?.system?.setContent == 'episodes'">
								<strong>{{ String(currentItemInfo?.info?.season).padStart(2, 0) }}x{{ String(currentItemInfo?.info?.episode).padStart(2, 0) }} - {{ currentItemInfo?.i18n_info?.[lang]?.epname }}</strong>
							</template>
							<template v-else>
								<strong>{{ currentItemInfo?.i18n_info?.[lang]?.otitle }}</strong> <span v-if="currentItemInfo?.info?.year" class="light">({{ currentItemInfo.info.year }})</span>
							</template>
						</div>
						<div v-if="currentPage?.data?.system?.setContent == 'episodes'" class="downloadModal-linkButtons">
							<BButton basicIcon smaller icon="fa-solid fa-chevron-left" :disabled="currentItemInfo.isFirst" :title="t('Previous episode')" @click="findNextMedia(false, true)" />
							<BButton basicIcon smaller icon="fa-solid fa-chevron-right" :disabled="currentItemInfo.isLast" :title="t('Next episode')" @click="findNextMedia(true, true)" />
						</div>
					</div>
				</div>
			</BModal>
			<BModal v-model:open="showCurrentSortModal" narrow :title="t('List sort')">
				<div class="downloadModal-link flex ai-c isHoverable" :class="{isActive: !currentPage.sortBy}" @click="setCurrentSortBy('')">
					<div class="downloadModal-linkTitle flex ai-c">{{ t('Default') }}</div>
				</div>
				<div class="downloadModal-link flex ai-c isHoverable" :class="{isActive: currentPage?.sortBy == 'rating'}" @click="setCurrentSortBy('rating')">
					<div class="downloadModal-linkTitle flex ai-c">{{ t('Rating') }}</div>
				</div>
				<div class="downloadModal-link flex ai-c isHoverable" :class="{isActive: currentPage?.sortBy == 'newest'}" @click="setCurrentSortBy('newest')">
					<div class="downloadModal-linkTitle flex ai-c">{{ t('Newest') }}</div>
				</div>
				<div class="downloadModal-link flex ai-c isHoverable" :class="{isActive: currentPage?.sortBy == 'oldest'}" @click="setCurrentSortBy('oldest')">
					<div class="downloadModal-linkTitle flex ai-c">{{ t('Oldest') }}</div>
				</div>
				<div class="downloadModal-link flex ai-c isHoverable" :class="{isActive: currentPage?.sortBy == 'longest'}" @click="setCurrentSortBy('longest')">
					<div class="downloadModal-linkTitle flex ai-c">{{ t('Longest') }}</div>
				</div>
				<div class="downloadModal-link flex ai-c isHoverable" :class="{isActive: currentPage?.sortBy == 'shortest'}" @click="setCurrentSortBy('shortest')">
					<div class="downloadModal-linkTitle flex ai-c">{{ t('Shortest') }}</div>
				</div>
			</BModal>
			<BModal v-model:open="searchData.genreSearchShow" narrow :title="`${t('Search')} ${searchIdMap['by-genre'][lang]}`">
				<form class="searchCont" @submit.prevent="doSearchByGenre">
					<div class="blockLabel baseLine">
						<span class="blockLabel-label">{{ t('Type') }}</span>
						<div class="radioGroup">
							<label class="radioGroup-label" :class="{isChecked: searchData.genreType == 'FMovies'}">
								<input class="sr-only" type="radio" v-model="searchData.genreType" value="FMovies" />
								<span class="radioGroup-title">{{ t('Movies') }}</span>
							</label>
							<label class="radioGroup-label" :class="{isChecked: searchData.genreType == 'FSeries'}">
								<input class="sr-only" type="radio" v-model="searchData.genreType" value="FSeries" />
								<span class="radioGroup-title">{{ t('Series') }}</span>
							</label>
						</div>
					</div>
					<label class="blockLabel baseLine">
						<span class="blockLabel-label">{{ t('Genre') }}</span>
						<select class="select isFull" v-model="searchData.genre">
							<option v-for="(option, key) in genresMap" :value="key">{{ option[lang] }}</option>
						</select>
					</label>
					<label class="blockLabel baseLine">
						<span class="blockLabel-label">{{ t('Order') }}</span>
						<select class="select isFull" v-model="searchData.genreOrder">
							<option value="rating">{{ t('Rating') }}</option>
							<option value="random">{{ t('Random') }}</option>
							<option value="name">{{ t('Name') }}</option>
							<option value="year">{{ t('Year') }}</option>
							<option value="mindate">{{ t('Newest streams') }}</option>
							<option value="duration">{{ t('Length') }}</option>
						</select>
					</label>
					<label class="blockLabel baseLine">
						<span class="blockLabel-label">{{ t('Min rating') }}</span>
						<input class="input isFull" type="number" v-model="searchData.genreRating">
					</label>
					<label class="blockLabel baseLine">
						<span class="blockLabel-label">{{ t('Year from') }}</span>
						<input class="input isFull" type="number" v-model="searchData.genreYear">
					</label>
					<div class="blockLabel baseLine">
						<span class="blockLabel-label">{{ t('Dubbed only') }}</span>
						<div class="radioGroup">
							<label class="radioGroup-label" :class="{isChecked: searchData.genreDub == '1'}">
								<input class="sr-only" type="radio" v-model="searchData.genreDub" value="1" />
								<span class="radioGroup-title">{{ t('Yes') }}</span>
							</label>
							<label class="radioGroup-label" :class="{isChecked: searchData.genreDub == '0'}">
								<input class="sr-only" type="radio" v-model="searchData.genreDub" value="0" />
								<span class="radioGroup-title">{{ t('No') }}</span>
							</label>
						</div>
					</div>
					<div class="settingsDivider baseLine"></div>
					<BButton class="baseLine" full icon="fa-solid fa-magnifying-glass" type="submit">{{ t('Search') }}</BButton>
				</form>
			</BModal>
			<BModal v-model:open="showSettingsModal" narrow :title="t('Settings')">
				<AppSettings :isWindows :isAndroid :isIOS @afterImport="afterImport" />
			</BModal>
			<BModal v-model:open="showHelpModal" narrow :title="t('Help')">
				<HelpModalContent />
			</BModal>
			<BModal v-model:open="showSyncModal" narrow :title="t('Synchronization')">
				<SyncModalContent @afterSync="afterImport" />
			</BModal>
			<BModal v-if="iOsInstallPrompt" v-model:open="iOsInstallHelper" narrow :title="t('Download App')">
				<div class="searchCont">
					<div>
						<div>{{ t('1. Press the "Share" button') }}</div>
						<img src="/img/step1.png" class="smallerLine" alt="" />
					</div>
					<div class="smallerLine">
						<div>{{ t('2. Select "Add to Home Screen" from the popup') }}</div>
						<img src="/img/step2.png" class="smallerLine" alt="" />
					</div>
					<div class="smallerLine">
						<div>{{ t('3. Tap "Add" in the top right corner') }}</div>
						<img src="/img/step3.png" class="smallerLine" alt="" />
					</div>
				</div>
			</BModal>
			<BModal v-model:open="csfdFrame.show" wider title="CSFD" class="movieDB-modal">
				<iframe :src="csfdFrame.src" referrerpolicy="no-referrer"></iframe>
			</BModal>
			<BModal v-model:open="trailerData.show" wider class="trailer-modal" @beforeClose="destroyTrailer">
				<video ref="videoEl" class="trailer" :src="trailerData.src" controls autoplay playsinline></video>
			</BModal>
		</div>
		<div v-else class="loginScreen">
			<div class="loginBox">
				<h2>{{ t('SC Login') }}</h2>
				<Transition name="maxHeight">
					<div v-if="appState.loginError" class="loginBox-error maxHeight line">
						{{ appState.loginError }}
					</div>
				</Transition>
				<form @submit.prevent="getToken" class="line">
					<label class="blockLabel line">
						<input class="input isFull" type="text" v-model="appState.krUser" :placeholder="t('Username')" autofocus required>
					</label>
					<label class="blockLabel line">
						<input class="input isFull" type="password" v-model="appState.krPass" :placeholder="t('Password')" required>
					</label>
					<label v-if="isStandalone" class="chGroup-label line">
						<input type="checkbox" class="cbGroup-cb" v-model="appState.krRemember" />
						<span class="cbGroup-title">{{ t('Remember me') }}</span>
					</label>
					<div class="line t-right">
						<BButton type="submit" :iconRight="appState.isLogging ? 'fa-solid fa-spinner fa-spin-pulse' : 'fa-solid fa-arrow-right-to-bracket'" :disabled="appState.isLogging">{{ t('Login') }}</BButton>
					</div>
				</form>
			</div>
		</div>
	</Transition>
	<div class="toaster">
		<TransitionGroup name="toasts">
			<div v-for="toast in toasts" class="toast" :key="toast.id">
				<i v-if="toast.icon == 'check'" class="toast-icon fa-regular fa-circle-check"></i>
				<i v-else-if="toast.icon == 'x'" class="toast-icon fa-solid fa-circle-exclamation"></i>
				<div class="toast-text">{{ toast.text }}</div>
				<BButton class="toast-x" @click="destroyToast(toast.id)">✕</BButton>
			</div>
		</TransitionGroup>
	</div>
</template>