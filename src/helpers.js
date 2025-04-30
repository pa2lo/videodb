export function reformatString(string) {
	return string.replace('[B]', '<b>').replace('[/B]', '</b>').replace('[I]', '<i>').replace('[/I]', '</i>').replace('[LIGHT]', '<span class=\'light\'>').replace('[/LIGHT]', '</span>')
}

export function slugify(string) {
	return string.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, ' ').trim().replace(/[\s-]+/g, '-')
}

const DOWNLOAD_SERVICE_URL = import.meta.env.VITE_DOWNLOAD_SERVICE_URL
import { downloadToken, uid } from "./store"

export async function getProxyData(url, abortSignal = null) {
	let splitURL = url.split('?')
	let newURL = `${splitURL[0]}?${splitURL[1].split('&').sort().join('&')}`
	let params = { url: encodeURI(newURL), token: downloadToken.value, uuid: uid.value }
	const response = await fetch(`${DOWNLOAD_SERVICE_URL}/proxy.php`, {
		method: 'POST',
		body: new URLSearchParams(params),
		signal: abortSignal ? AbortSignal.any([abortSignal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000)
	})
	const data = await response.json()
	return data
}