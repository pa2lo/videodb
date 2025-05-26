import { downloadHistory, favItems, bookmarks, syncKey, syncTS, syncAdded, showToast, syncing, syncError } from "./store"
import { t } from "./labels"

const DOWNLOAD_SERVICE_URL = import.meta.env.VITE_DOWNLOAD_SERVICE_URL

export const sync = {
	checkInterval: null,
	async sendData(action, body) {
		syncing.value = true
		syncError.value = ''
		try {
			const response = await fetch(`${DOWNLOAD_SERVICE_URL}/sync.php?action=${action}`, {
				method: 'POST',
				body: new URLSearchParams(body),
				signal: AbortSignal.timeout(10000)
			})
			const data = await response.json()

			return data
		} catch (error) {
			console.log(error)
			return false
		} finally {
			syncing.value = false
		}
	},
	async onInit() {
		return new Promise(async resolve => {
			if (!syncKey.value) return resolve(false)

			const res = await this.connect(syncKey.value)

			return resolve(res)
		})
	},
	async newSync() {
		const res = await this.sendData('create', {
			history: this.getStringifiedData('history'),
			favs: this.getStringifiedData('favs'),
			bookmarks: this.getStringifiedData('bookmarks')
		})

		if (res.success && res.data?.id) {
			syncKey.value = res.data.id
			syncAdded.value = res.data.created
			syncTS.value = res.data.created
			showToast(t('Synchronization successfully set'), 'check')
			this.setCheckInterval()
		} else syncError.value = 'Failed to set up synchronization'
	},
	async update(param) {
		if (!syncKey.value) return

		const res = await this.sendData('update', {
			id: syncKey.value,
			param: param,
			data: this.getStringifiedData(param)
		})

		if (res?.data?.ts) syncTS.value = res.data.ts
	},
	async connect(id, isNewKey) {
		const res = await this.sendData('connect', {
			id
		})

		if (res?.success && res.data?.id) {
			if (res.data.history) downloadHistory.value = res.data.history
			if (res.data.favs) favItems.value = res.data.favs
			if (res.data.bookmarks) bookmarks.value = res.data.bookmarks

			const now = Date.now()
			syncTS.value = now

			if (isNewKey) {
				syncKey.value = res.data.id
				syncAdded.value = now

				showToast(t('Synchronization successfully set'), 'check')
			}

			if (!this.checkInterval) this.setCheckInterval()
		} else {
			syncError.value = 'Synchronization ID does not exist'
		}

		return res
	},
	setCheckInterval() {
		if (!syncKey.value) return

		this.checkInterval = setInterval(() => {
			this.checkTS()
		}, 300000)
	},
	async checkTS() {
		const res = await this.sendData('check', {
			id: syncKey.value
		})

		if (!res.success || !res.data?.updated) {
			syncError.value = 'Sync error'
			clearInterval(this.checkInterval)
			console.log(res)
			return
		}

		if (res.data?.updated > syncTS.value) this.connect(syncKey.value)
	},
	getStringifiedData(param) {
		if (param == 'history') return JSON.stringify(downloadHistory.value)
		else if (param == 'favs') return JSON.stringify(favItems.value)
		else if (param == 'bookmarks') return JSON.stringify(bookmarks.value)
	},
	resetSync() {
		syncKey.value = ''
		syncAdded.value = ''
		syncTS.value = ''
		if (this.checkInterval) clearInterval(this.checkInterval)
		showToast('Synchronization cancelled', 'check')
	}
}