export function reformatString(string) {
	return string.replace('[B]', '<b>').replace('[/B]', '</b>').replace('[I]', '<i>').replace('[/I]', '</i>').replace('[LIGHT]', '<span class=\'light\'>').replace('[/LIGHT]', '</span>')
}

export function slugify(string) {
	return string.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, ' ').trim().replace(/[\s-]+/g, '-')
}

export function abortSignalAny(signals) {
	if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals);

	const controller = new AbortController();
	const onAbort = () => controller.abort();

	for (const signal of signals) {
		if (signal.aborted) {
			controller.abort();
			break;
		}
		signal.addEventListener('abort', onAbort, { once: true });
	}

	return controller.signal;
}

export function fixRating(arr) {
	return arr.map((item, index, arr) => {
		if (item.info?.rating && item.info.rating > 0 && item.info.rating < 1) item.info.rating = parseFloat((item.info.rating * 10).toFixed(2))
	})
}

const DOWNLOAD_SERVICE_URL = import.meta.env.VITE_DOWNLOAD_SERVICE_URL
import { downloadToken, uid } from "./store"

let requestCache = {}
const CACHE_LIFETIME = 30 * 60 * 1000

export async function getProxyData(url, abortSignal = null, body = null, loader = null) {
	let splitURL = url.split('?')
	let usedKeys = []
	let newURL = `${splitURL[0]}?${splitURL[1].split('&').sort().filter(i => {
		let [key] = i.split('=')
		if (usedKeys.includes(key)) return false
		return usedKeys.push(key)
	}).join('&')}`

	let params = { url: encodeURI(newURL).replaceAll('%25','%'), token: downloadToken.value, uuid: uid.value }
	if (body) params.data = body

	let cacheKey = body ? url+body.toString() : url

	if (requestCache[cacheKey] && Date.now() - requestCache[cacheKey].ts < CACHE_LIFETIME) return JSON.parse(JSON.stringify(requestCache[cacheKey].data))

	try {
		if (loader) loader()

		const response = await fetch(`${DOWNLOAD_SERVICE_URL}/proxy.php`, {
			method: 'POST',
			body: new URLSearchParams(params),
			signal: abortSignal ? abortSignalAny([abortSignal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000)
		})
		const data = await response.json()

		requestCache[cacheKey] = {
			data: data,
			ts: Date.now()
		}

		return JSON.parse(JSON.stringify(data))
	} catch (error) {
		console.log(error)
		return null
	}
}