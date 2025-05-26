import { currentPage, currentItemInfo, gCastAvailable, gCastConnected } from "./store"

export const gCast = {
	gCastContext: null,
	debugChanges: false,
	updateGCastAvailability() {
		const state = this.gCastContext.getCastState()

		gCastAvailable.value = state != cast.framework.CastState.NO_DEVICES_AVAILABLE
		gCastConnected.value = state === cast.framework.CastState.CONNECTED

		if (this.debugChanges) console.log({
			gCastAvailable: gCastAvailable.value,
			gCastConnected: gCastConnected.value
		})
	},
	init(debugChanges = false) {
		this.debugChanges = debugChanges
		if (window.chrome && !window.chrome.cast) {
			var script = document.createElement('script')
			script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
			document.head.appendChild(script)

			if (this.debugChanges) console.log('script appended')

			window['__onGCastApiAvailable'] = function(isAvailable) {
				gCast.gCastContext = cast.framework.CastContext.getInstance()
				gCast.gCastContext.setOptions({
					receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
					autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
				})

				gCast.updateGCastAvailability()

				gCast.gCastContext.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, gCast.updateGCastAvailability)
			}
		}
	},
	disconnect() {
		cast.framework.CastContext.getInstance().endCurrentSession(true)
	},
	async stream(link) {
		try {
			const mediaInfo = new chrome.cast.media.MediaInfo(link, 'video/mp4')

			mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata()

			let metadataTitle = currentItemInfo.value?.i18n_info?.[lang.value]?.otitle || ''
			if (currentPage.value?.data?.system?.setContent == 'episodes') metadataTitle += ` ${String(currentItemInfo.value?.info?.season).padStart(2, 0)}x${String(currentItemInfo.value?.info?.episode).padStart(2, 0)}`
			else if (currentItemInfo.value?.info?.year) metadataTitle += currentItemInfo.value.info.year

			mediaInfo.metadata.title = metadataTitle;
			if (currentItemInfo.value?.i18n_art?.[lang.value]?.poster) mediaInfo.metadata.images = [{
				url: currentItemInfo.value.i18n_art[lang.value].poster
			}]

			const request = new chrome.cast.media.LoadRequest(mediaInfo)
			request.autoplay = true

			if (!this.gCastContext?.getCurrentSession()) await this.gCastContext.requestSession()

			setTimeout(() => {
				gCast.gCastContext.getCurrentSession().loadMedia(request).then((res) => {
					console.log('video played')
				}).catch((err) => {
					console.log(err)
				})
			}, 0)
		} catch (err) {
			console.error('Cast session request failed', err);
		}
	}
}