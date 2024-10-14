<script setup>
import { t } from '@/labels'

import BButton from './BButton.vue'

import { lang, listsort, theme, dubOnly, winPlayer, hpWidgets, downloadHistory, favs, seriesHistory, moviesHistory, generatorQuality, generatorShows, generatorShowsHistory, widgetsMap, bookmarks, showToast, uid } from '../store'

defineProps({
	isWindows: Boolean
})

const emit = defineEmits(['afterImport'])

function clearDownloadHistory() {
	downloadHistory.value = []
	seriesHistory.value = []
	moviesHistory.value = []
	showToast(t('Watched list deleted'), 'check')
}
function clearSeriesHistory() {
	seriesHistory.value = []
	showToast(t('Watched series deleted'), 'check')
}
function clearMoviesHistory() {
	moviesHistory.value = []
	showToast(t('Watched movies deleted'), 'check')
}
function clearFavs() {
	favs.value = []
	showToast(t('Favorites deleted'), 'check')
}
function clearBookmarks() {
	bookmarks.value = []
	showToast(t('Bookmarks deleted'), 'check')
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
	if (dubOnly.value) dataObject.dubOnly = dubOnly.value
	if (winPlayer.value) dataObject.winPlayer = winPlayer.value
	if (generatorQuality.value) dataObject.generatorQuality = generatorQuality.value

	if (downloadHistory.value.length) dataObject.downloadHistory = downloadHistory.value
	if (seriesHistory.value.length) dataObject.seriesHistory = seriesHistory.value
	if (moviesHistory.value.length) dataObject.moviesHistory = moviesHistory.value
	if (favs.value.length) dataObject.favs = favs.value
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
					if (!['lang', 'listsort', 'theme', 'dubOnly', 'winPlayer', 'generatorQuality', 'uid', 'hpWidgets', 'downloadHistory', 'seriesHistory', 'moviesHistory', 'favs', 'bookmarks', 'generatorShows', 'generatorShowsHistory'].some(k => Object.keys(fileData).includes(k))) return showToast('No data to import')

					if (confirm(t('Import will overwrite all data and settings. Are you sure you want to import data?')) == true) {
						if (fileData.lang) lang.value = fileData.lang
						if (fileData.listsort) listsort.value = fileData.listsort
						if (fileData.theme) theme.value = fileData.theme
						if (fileData.dubOnly) dubOnly.value = fileData.dubOnly
						if (fileData.winPlayer) winPlayer.value = fileData.winPlayer
						if (fileData.generatorQuality) generatorQuality.value = fileData.generatorQuality
						if (fileData.uid) uid.value = fileData.uid

						if (fileData.hpWidgets?.length) hpWidgets.value = fileData.hpWidgets
						if (fileData.downloadHistory?.length) downloadHistory.value = fileData.downloadHistory
						if (fileData.seriesHistory?.length) seriesHistory.value = fileData.seriesHistory
						if (fileData.moviesHistory?.length) moviesHistory.value = fileData.moviesHistory
						if (fileData.favs?.length) favs.value = fileData.favs
						if (fileData.bookmarks?.length) bookmarks.value = fileData.bookmarks
						if (fileData.generatorShows?.length) generatorShows.value = fileData.generatorShows
						if (fileData.generatorShowsHistory?.length) generatorShowsHistory.value = fileData.generatorShowsHistory

						showToast('Import finished', 'check')

						emit('afterImport')
					}
				}
				reader.readAsText(file)
			} else showToast('Unsupported file format')
		}
	}

	input.click()
}
</script>

<template>
	<div class="searchCont">
		<label class="blockLabel line">
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
		<div class="blockLabel line">
			<span class="blockLabel-label">{{ t('Language') }}</span>
			<div class="radioGroup">
				<label class="radioGroup-label" :class="{isChecked: lang == 'sk'}">
					<input class="sr-only" type="radio" name="lang" v-model="lang" value="sk" />
					<span class="radioGroup-title">SK</span>
				</label>
				<label class="radioGroup-label" :class="{isChecked: lang == 'cs'}">
					<input class="sr-only" type="radio" name="lang" v-model="lang" value="cs" />
					<span class="radioGroup-title">CZ</span>
				</label>
				<label class="radioGroup-label" :class="{isChecked: lang == 'en'}">
					<input class="sr-only" type="radio" name="lang" v-model="lang" value="en" />
					<span class="radioGroup-title">EN</span>
				</label>
			</div>
		</div>
		<div class="blockLabel line">
			<span class="blockLabel-label">{{ t('Theme') }}</span>
			<div class="radioGroup">
				<label class="radioGroup-label" :class="{isChecked: theme == ''}">
					<input class="sr-only" type="radio" name="theme" v-model="theme" value="" />
					<span class="radioGroup-title">Auto</span>
				</label>
				<label class="radioGroup-label" :class="{isChecked: theme == 'dark'}">
					<input class="sr-only" type="radio" name="theme" v-model="theme" value="dark" />
					<span class="radioGroup-title">{{ t('Dark') }}</span>
				</label>
				<label class="radioGroup-label" :class="{isChecked: theme == 'light'}">
					<input class="sr-only" type="radio" name="theme" v-model="theme" value="light" />
					<span class="radioGroup-title">{{ t('Light') }}</span>
				</label>
			</div>
		</div>
		<div class="blockLabel line">
			<span class="blockLabel-label">{{ t('Dubbed only') }}</span>
			<div class="radioGroup">
				<label class="radioGroup-label" :class="{isChecked: dubOnly == 'yes'}">
					<input class="sr-only" type="radio" name="dubonly" v-model="dubOnly" value="yes" />
					<span class="radioGroup-title">{{ t('Yes') }}</span>
				</label>
				<label class="radioGroup-label" :class="{isChecked: dubOnly == 'no'}">
					<input class="sr-only" type="radio" name="dubonly" v-model="dubOnly" value="no" />
					<span class="radioGroup-title">{{ t('No') }}</span>
				</label>
			</div>
		</div>
		<div class="blockLabel line">
			<span class="blockLabel-label">{{ t('Random episode - stream quality') }}</span>
			<div class="radioGroup">
				<label class="radioGroup-label" :class="{isChecked: generatorQuality == 'low'}">
					<input class="sr-only" type="radio" name="generatorquality" v-model="generatorQuality" value="low" />
					<span class="radioGroup-title">{{ t('Low') }}</span>
				</label>
				<label class="radioGroup-label" :class="{isChecked: generatorQuality == 'medium'}">
					<input class="sr-only" type="radio" name="generatorquality" v-model="generatorQuality" value="medium" />
					<span class="radioGroup-title">{{ t('Medium') }}</span>
				</label>
				<label class="radioGroup-label" :class="{isChecked: generatorQuality == 'high'}">
					<input class="sr-only" type="radio" name="generatorquality" v-model="generatorQuality" value="high" />
					<span class="radioGroup-title">{{ t('High') }}</span>
				</label>
			</div>
		</div>
		<div v-if="isWindows" class="blockLabel line">
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
		<div class="blockLabel line">
			<span class="blockLabel-label">{{ t('Homepage widgets') }}</span>
			<div class="cbGroup">
				<label v-for="(val, key) in widgetsMap" class="chGroup-label">
					<input type="checkbox" class="cbGroup-cb" :value="key" v-model="hpWidgets" />
					<span class="cbGroup-title">{{ val.sectionTitle[lang] }}</span>
				</label>
			</div>
		</div>
		<BButton class="line" full dark @click="clearDownloadHistory" :disabled="!downloadHistory.length">{{ t('Delete watched list') }}</BButton>
		<BButton class="smallerLine" full dark @click="clearMoviesHistory" :disabled="!moviesHistory.length">{{ t('Delete watched movies') }}</BButton>
		<BButton class="smallerLine" full dark @click="clearSeriesHistory" :disabled="!seriesHistory.length">{{ t('Delete watched series') }}</BButton>
		<BButton class="smallerLine" full dark @click="clearFavs" :disabled="!favs.length">{{ t('Delete favorites') }}</BButton>
		<BButton class="smallerLine" full dark @click="clearBookmarks" :disabled="!bookmarks.length">{{ t('Delete bookmarks') }}</BButton>
		<BButton class="smallerLine" full dark @click="clearGeneratorHistory" :disabled="!generatorShowsHistory.length">{{ t('Delete Random episodes history') }}</BButton>
		<div class="settingsDivider smallerLine"></div>
		<BButton class="smallerLine" full dark @click="exportData" :disabled="!downloadHistory.length && !moviesHistory.length && !seriesHistory.length && !favs.length && !bookmarks.length && !generatorShowsHistory.length">{{ t('Export data') }}</BButton>
		<BButton class="smallerLine" full dark @click="importData">{{ t('Import data') }}</BButton>
	</div>
</template>