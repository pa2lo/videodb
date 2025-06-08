<script setup>
import { t } from '@/labels'

import BButton from './BButton.vue'
import BRadio from './BRadio.vue'

import { lang, listsort, theme, streamsLang, incDV, incHDR, winPlayer, androidPlayer, iosPlayer, hpWidgets, downloadHistory, favItems, generatorQuality, generatorShows, generatorShowsHistory, widgetsMap, bookmarks, showToast, uid, copyLinkButton, showBackItem } from '../store'
import { sync } from '@/sync'

defineProps({
	isWindows: Boolean,
	isAndroid: Boolean,
	isIOS: Boolean
})

const emit = defineEmits(['afterImport'])

function clearDownloadHistory() {
	downloadHistory.value = []
	showToast(t('Watched list deleted'), 'check')
	sync.update('history')
}
function clearFavs() {
	favItems.value = []
	showToast(t('Favorites deleted'), 'check')
	sync.update('favs')
}
function clearBookmarks() {
	bookmarks.value = []
	showToast(t('Bookmarks deleted'), 'check')
	sync.update('bookmarks')
}
function clearGeneratorHistory() {
	generatorShowsHistory.value = []
	showToast(t('Random episodes history deleted'), 'check')
}

function exportData() {
	let dataObject = {}
	if (lang.value) dataObject.lang = lang.value
	if (listsort.value) dataObject.listsort = listsort.value
	if (theme.value) dataObject.theme = theme.value
	if (streamsLang.value) dataObject.streamsLang = streamsLang.value
	if (generatorQuality.value) dataObject.generatorQuality = generatorQuality.value

	if (downloadHistory.value.length) dataObject.downloadHistory = downloadHistory.value
	if (favItems.value.length) dataObject.favItems = favItems.value
	if (bookmarks.value.length) dataObject.bookmarks = bookmarks.value
	if (generatorShows.value.length) dataObject.generatorShows = generatorShows.value
	if (generatorShowsHistory.value.length) dataObject.generatorShowsHistory = generatorShowsHistory.value

	dataObject.hpWidgets = hpWidgets.value
	dataObject.uid = uid.value

	const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(dataObject))}`;
	const link = document.createElement("a");
	link.href = jsonString;
	link.download = `VideoDB-data-${Date.now()}.json`;

	link.click();
}
function importData() {
	const input = document.createElement('input')
	input.type = 'file'

	input.onchange = (e) => {
		if (input.files) {
			const file = input.files[0]
			if (file.name.includes('.json') && file.type == 'application/json') {
				const reader = new FileReader()
				reader.onerror = (err) => showToast(err)
				reader.onload = (data) => {
					let fileData = JSON.parse(data.target.result)
					if (typeof fileData != 'object') return showToast('Unsupported file content')
					if (!Object.keys(fileData).length) return showToast('File is empty')
					if (!['lang', 'listsort', 'theme', 'streamsLang', 'generatorQuality', 'uid', 'hpWidgets', 'downloadHistory', 'favItems', 'bookmarks', 'generatorShows', 'generatorShowsHistory'].some(k => Object.keys(fileData).includes(k))) return showToast('No data to import')

					if (confirm(t('Import will overwrite all data and settings. Are you sure you want to import data?')) == true) {
						if (fileData.lang) lang.value = fileData.lang
						if (fileData.listsort) listsort.value = fileData.listsort
						if (fileData.theme) theme.value = fileData.theme
						if (fileData.streamsLang) streamsLang.value = fileData.streamsLang
						if (fileData.generatorQuality) generatorQuality.value = fileData.generatorQuality
						if (fileData.uid) uid.value = fileData.uid

						if (fileData.hpWidgets?.length) hpWidgets.value = fileData.hpWidgets
						if (fileData.downloadHistory?.length) downloadHistory.value = fileData.downloadHistory
						if (fileData.favItems?.length) favItems.value = fileData.favItems
						if (fileData.bookmarks?.length) bookmarks.value = fileData.bookmarks
						if (fileData.generatorShows?.length) generatorShows.value = fileData.generatorShows
						if (fileData.generatorShowsHistory?.length) generatorShowsHistory.value = fileData.generatorShowsHistory

						showToast('Import finished', 'check')

						emit('afterImport')

						sync.update('history')
						sync.update('favs')
						sync.update('bookmarks')
					}
				}
				reader.readAsText(file)
			} else showToast('Unsupported file format')
		}
	}

	input.click()
}

const langOptions = [
	{ title: 'SK', value: 'sk' },
	{ title: 'CZ', value: 'cs' },
	{ title: 'EN', value: 'en' }
]
const boolOptions = [
	{ title: 'Yes',	value: 1 },
	{ title: 'No', value: 0	}
]
const streamsLangOptions = [
	{ title: 'All languages', value: 0 },
	{ title: 'Dubbing or subtitles', value: 1 },
	{ title: 'Dubbing only', value: 2 }
]
const themeOptions = [
	{ title: 'Auto', value: '' },
	{ title: 'Dark', value: 'dark' },
	{ title: 'Light', value: 'light' }
]
const randomEpisodeQualityOptions = [
	{ title: 'Low', value: 'low' },
	{ title: 'Medium', value: 'medium' },
	{ title: 'High', value: 'high' }
]
const androidPlayerOptions = [
	{ title: 'MPV', value: 'mpv' },
	{ title: 'VLC',	value: 'vlc' }
]
const iosPlayerOptions = [
	{ title: 'VLC', value: 'vlc' },
	{ title: 'VLC (alt)', value: 'vlc2' },
	{ title: 'NPlayer', value: 'nplayer' }
]
</script>

<template>
	<div class="searchCont">
		<label class="blockLabel baseLine">
			<span class="blockLabel-label">{{ t('List sort') }}</span>
			<select name="listsort" class="select isFull" v-model="listsort">
				<option value="">{{ t('Default') }}</option>
				<option value="rating">{{ t('Rating') }}</option>
				<option value="newest">{{ t('Newest') }}</option>
				<option value="oldest">{{ t('Oldest') }}</option>
				<option value="longest">{{ t('Longest') }}</option>
				<option value="shortest">{{ t('Shortest') }}</option>
			</select>
		</label>
		<BRadio label="Language" :options="langOptions" v-model="lang" />
		<BRadio label="Theme" :options="themeOptions" v-model="theme" />
		<label class="blockLabel baseLine">
			<span class="blockLabel-label">{{ t('Show streams with language') }}</span>
			<select name="streamlang" class="select isFull" v-model="streamsLang">
				<option v-for="opt in streamsLangOptions" :value="opt.value">{{ t(opt.title) }}</option>
			</select>
		</label>
		<BRadio label="Include HDR" :options="boolOptions" v-model="incHDR" />
		<BRadio label="Include Dolby Vision" :options="boolOptions" v-model="incDV" />
		<BRadio label="Random episode - stream quality" :options="randomEpisodeQualityOptions" v-model="generatorQuality" />
		<BRadio v-if="isAndroid" label="Video player" labelNote="(Android)" :options="androidPlayerOptions" v-model="androidPlayer" />
		<BRadio v-if="isIOS" label="Video player" labelNote="(iOS)" :options="iosPlayerOptions" v-model="iosPlayer" />
		<div v-if="isWindows" class="blockLabel baseLine">
			<span class="blockLabel-label">{{ t('Video player') }} (Windows)</span>
			<div class="radioGroup">
				<label class="radioGroup-label" :class="{isChecked: winPlayer == 'pot'}">
					<input class="sr-only" type="radio" name="winplayer" v-model="winPlayer" value="pot" />
					<span class="radioGroup-title">PotPlayer</span>
				</label>
				<label class="radioGroup-label" :class="{isChecked: winPlayer == 'vlc'}">
					<input class="sr-only" type="radio" name="winplayer" v-model="winPlayer" value="vlc" />
					<span class="radioGroup-title">VLC</span>
				</label>
			</div>
			<template v-if="winPlayer == 'vlc'">
				<div class="smallLine">{{ t('To play videos in VLC, you need to install protocols') }}:</div>
				<div>
					<a href="/reg-protocol/win-vlc-add.reg" download>{{ t('Install VLC protocols') }}</a><br>
					<a href="/reg-protocol/win-vlc-delete.reg" download>{{ t('Remove VLC protocols') }}</a>
				</div>
			</template>
		</div>
		<BRadio label="Show copy link button" :options="boolOptions" v-model="copyLinkButton" />
		<BRadio label="Show 'Back' item" :options="boolOptions" v-model="showBackItem" />
		<div class="blockLabel baseLine">
			<span class="blockLabel-label">{{ t('Homepage widgets') }}</span>
			<div class="cbGroup">
				<label v-for="(val, key) in widgetsMap" class="chGroup-label">
					<input type="checkbox" class="cbGroup-cb" :value="key" v-model="hpWidgets" />
					<span class="cbGroup-title">{{ val.sectionTitle[lang] }}</span>
				</label>
			</div>
		</div>
		<BButton class="line" full dark @click="clearDownloadHistory" :disabled="!downloadHistory.length">{{ t('Delete watched list') }}</BButton>
		<BButton class="smallerLine" full dark @click="clearFavs" :disabled="!favItems.length">{{ t('Delete favorites') }}</BButton>
		<BButton class="smallerLine" full dark @click="clearBookmarks" :disabled="!bookmarks.length">{{ t('Delete bookmarks') }}</BButton>
		<BButton class="smallerLine" full dark @click="clearGeneratorHistory" :disabled="!generatorShowsHistory.length">{{ t('Delete Random episodes history') }}</BButton>
		<div class="settingsDivider baseLine"></div>
		<BButton class="baseLine" full dark @click="exportData" :disabled="!downloadHistory.length && !favItems.length && !bookmarks.length && !generatorShowsHistory.length">{{ t('Export data') }}</BButton>
		<BButton class="smallerLine" full dark @click="importData">{{ t('Import data') }}</BButton>
	</div>
</template>