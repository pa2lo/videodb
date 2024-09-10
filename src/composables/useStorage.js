import { ref, watch } from "vue"

export function useStorage(key, defaultVal = '', saveIfNotExist = false) {
	let storedVal = JSON.parse(localStorage.getItem(key))

	let val = ref(storedVal != undefined ? storedVal : defaultVal)

	if (!storedVal && defaultVal && saveIfNotExist) localStorage.setItem(key, JSON.stringify(val.value))

	watch(val, () => {
		if ((val.value === null || val.value == '' || val.value == defaultVal) && val.value !== 0) localStorage.removeItem(key)
		else localStorage.setItem(key, JSON.stringify(val.value))
	}, { deep: typeof defaultVal == 'object' })

	return val
}