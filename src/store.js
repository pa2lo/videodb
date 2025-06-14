import { ref } from "vue"
import { useStorage } from "./composables/useStorage"

export const lang = useStorage('lang', 'sk')
export const listsort = useStorage('listsort', '')
export const streamsLang = useStorage('streamsLang', 2)
export const incHDR = useStorage('incHDR', 1)
export const incDV = useStorage('incHDR', 0)
export const token = useStorage('token', null)
export const downloadToken = useStorage('downloadToken', null)
export const tokenDate = useStorage('tokenDate', null)
export const uid = useStorage('uid', `9802BF2F-C445-552D-A3EE-${Date.now()}`, true)
export const downloadHistory = useStorage('downloadHistory', [])
export const favItems = useStorage('favItems', [])
export const generatorShows = useStorage('generatorShows', ["4158", "3757", "14264", "3670", "7410", "4245", "3844", "68191", '11518', '14601', '9719', '3824', '14362'])
export const videoLayout = useStorage('videoLayout', 'listLeft')
export const generatorQuality = useStorage('generatorQuality', 'medium')
export const generatorShowsHistory = useStorage('generatorShowsHistory', [])
export const bookmarks = useStorage('bookmarks', [])
export const theme = useStorage('theme', '')
export const showBackItem = useStorage('showBackItem', 0)
export const copyLinkButton = useStorage('copyLinkButton', 0)
export const hpWidgets = useStorage('hpWidgets', ["menu","wm-01","ws-01","ws-last","favs"])
export const winPlayer = useStorage('winPlayer', 'pot')
export const androidPlayer = useStorage('androidPlayer', 'mpv')
export const iosPlayer = useStorage('iosPlayer', 'vlc')

export const syncKey = useStorage('syncKey', '')
export const syncTS = useStorage('syncTS', '')
export const syncAdded = useStorage('syncAdded', '')
export const syncing = ref(false)
export const syncError = ref('')

export const currentPage = ref(null)
export const currentItemInfo = ref(null)
export const toasts = ref([])
export const gCastAvailable = ref(false)
export const gCastConnected = ref(false)

export const ignoreMouseEvents = ref(false)

export function getQueryParams() {
	const params = new URLSearchParams({
		DV: incDV.value,
		HDR: incHDR.value,
		lang: lang.value,
		uid: uid.value,
		ver: '2.0'
	})
	if (streamsLang.value > 0) params.append('dub', 1)
	if (streamsLang.value == 1) params.append('tit', 1)
	return params.toString()
}

// maps
export const widgetsMap = {
	'menu': {
		sectionTitle: {
			sk: 'Menu',
			cs: 'Menu',
			en: 'Menu'
		}
	},
	'wm-01': {
		sectionTitle: {
			sk: 'Filmy - novinky',
			cs: 'Filmy - novinky',
			en: 'Movies - new'
		},
		fetchUrl: '/FMovies/latest',
		url: '/FMovies/latest'
	},
	'wm-02': {
		sectionTitle: {
			sk: 'Filmy - najnovšie streamy',
			cs: 'Filmy - nejnovější streamy',
			en: 'Movies - new streams'
		},
		fetchUrl: '/FMovies/newstream',
		url: '/FMovies/newstream'
	},
	'wm-03': {
		sectionTitle: {
			sk: 'Filmy - Netflix',
			cs: 'Filmy - Netflix',
			en: 'Movies - Netflix'
		},
		fetchUrl: '/Search/getList/99?gen=1&limit=30&od=desc&of=mindate',
		url: '/Search/getList/99?gen=1&limit=30&od=desc&of=mindate'
	},
	'wm-04': {
		sectionTitle: {
			sk: 'Filmy - náhodné',
			cs: 'Filmy - náhodné',
			en: 'Movies - random'
		},
		fetchUrl: '/Filter/?limit=30&od=desc&of=random&r=>60&typ=1&y=>2010',
		url: '/Filter/?typ=1&pg=0&r=>60&y=>2010&of=random&od=desc&limit=20&page=1'
	},
	'ws-01': {
		sectionTitle: {
			sk: 'Seriály - novinky',
			cs: 'Seriály - novinky',
			en: 'TV Shows - new'
		},
		fetchUrl: '/FSeries/latestt',
		url: '/FSeries/latestt'
	},
	'ws-02': {
		sectionTitle: {
			sk: 'Seriály - najnovšie pridané',
			cs: 'Seriály - nejnovější přidané',
			en: 'TV Shows - latest shows'
		},
		fetchUrl: '/FSeries/latest',
		url: '/FSeries/latest'
	},
	'wm-last': {
		sectionTitle: {
			sk: 'Filmy - posledne sledované',
			cs: 'Filmy - posledně sledované',
			en: 'Movies - watched'
		}
	},
	'ws-last': {
		sectionTitle: {
			sk: 'Seriály - posledne sledované',
			cs: 'Seriály - posledně sledované',
			en: 'TV Shows - watched'
		}
	},
	'favs': {
		sectionTitle: {
			sk: 'Obľúbené',
			cs: 'Oblíbené',
			en: 'Favorites'
		}
	}
}
export const showsMap = {
	'4158': 'Simpsons',
	'3757': 'Futurama',
	'14264': 'Family Guy',
	'3670': 'Two and a Half Man',
	'7410': 'Red Dwarf',
	'4245': 'IT Crowd',
	'3844': 'South Park',
	'68191': 'Big Bang Theory',
	'11518': '2 Broke Girls',
	'14601': 'American Dad',
	'9719': 'Brickleberry',
	'3824': 'How I Met Your Mother',
	// '3744': 'Comeback',
	'14362': 'Rick and Morty'
}
export const searchIdMap = {
	'search-movie': {
		sk: 'film podľa názvu',
		cs: 'film podle názvu',
		en: 'movie by title',
	},
	'search-series': {
		sk: 'seriál podľa názvu',
		cs: 'seriál podle názvu',
		en: 'series by title'
	},
	'search-people-movie': {
		sk: 'film podľa herca',
		cs: 'film podle herce',
		en: 'movie by actor'
	},
	'search-people-series': {
		sk: 'seriál podľa herca',
		cs: 'seriál podle herce',
		en: 'series by actor'
	},
	'by-genre': {
		sk: 'podľa žánru',
		cs: 'podle žánru',
		en: 'by genre'
	}
}
export const genresMap = {
	1: {
		"en": "Action",
		"cs": "Akční",
		"sk": "Akčné"
	},
	100: {
		"en": "Sci-Fi",
		"cs": "Sci-Fi",
		"sk": "Sci-Fi"
	},
	128: {
		"en": "Animated",
		"cs": "Animovaný",
		"sk": "Animovaný"
	},
	135371: {
		"en": "Stand-up",
		"cs": "Stand-up",
		"sk": "Stand-up"
	},
	1368: {
		"en": "Family",
		"cs": "Rodinný",
		"sk": "Rodinný"
	},
	1369: {
		"en": "Musical",
		"cs": "Muzikál",
		"sk": "Muzikál"
	},
	1488: {
		"en": "Music",
		"cs": "Hudební",
		"sk": "Hudobný"
	},
	153: {
		"en": "Mysterious",
		"cs": "Mysteriózní",
		"sk": "Mysteriózne"
	},
	178: {
		"en": "War",
		"cs": "Válečný",
		"sk": "Vojnový"
	},
	1795: {
		"en": "Documentary",
		"cs": "Dokumentární",
		"sk": "Dokumentárny"
	},
	1820: {
		"en": "Fairytale",
		"cs": "Pohádka",
		"sk": "Rozprávka"
	},
	2: {
		"en": "Crime",
		"cs": "Krimi",
		"sk": "Krimi"
	},
	210: {
		"en": "Adventure",
		"cs": "Dobrodružný",
		"sk": "Dobrodružný"
	},
	211: {
		"en": "Fantasy",
		"cs": "Fantasy",
		"sk": "Fantasy"
	},
	241: {
		"en": "Biographical",
		"cs": "Životopisný",
		"sk": "Životopisný"
	},
	242: {
		"en": "Historic",
		"cs": "Historický",
		"sk": "Historický"
	},
	3: {
		"en": "Comedy",
		"cs": "Komedie",
		"sk": "Komédia"
	},
	394: {
		"en": "Horor",
		"cs": "Horor",
		"sk": "Horor"
	},
	4: {
		"en": "Thriller",
		"cs": "Thriller",
		"sk": "Thriller"
	},
	5: {
		"en": "Drama",
		"cs": "Drama",
		"sk": "Dráma"
	},
	5160: {
		"en": "Erotic",
		"cs": "Erotický",
		"sk": "Erotický"
	},
	63: {
		"en": "Western",
		"cs": "Western",
		"sk": "Western"
	},
	694: {
		"en": "Sports",
		"cs": "Sportovní",
		"sk": "Športový"
	},
	86: {
		"en": "Romantic",
		"cs": "Romantický",
		"sk": "Romantický"
	}
}

// toaster actions
export function showToast(text, icon, timeout = 5000) {
	let id = `toast-${Date.now()}`
	toasts.value.push({
		id,	text, icon
	})
	if (timeout > 0) {
		setTimeout(() => {
			destroyToast(id)
		}, timeout)
	}
}
export function destroyToast(id) {
	let index = toasts.value.findIndex(t => t.id == id)
	if (index > -1) toasts.value.splice(index, 1)
}

// cached pages
export const homepageLinks = {
	"menu": [
		{
			"type": "dir",
			"url": "/FMovies",
			"id": "movies",
			"i18n_info": {
				"en": {"title": "Movies"},
				"cs": {"title": "Filmy"},
				"sk": {"title": "Filmy"}
			},
			"icon": "fa-solid fa-film"
		},
		{
			"type": "dir",
			"url": "/FSeries",
			"id": "series",
			"i18n_info": {
				"en": {"title": "Series"},
				"cs": {"title": "Seriály"},
				"sk": {"title": "Seriály"}
			},
			"icon": "fa-solid fa-tv"
		},
		{
			"type": "dir",
			"url": "/FKoncert",
			"id": "koncert",
			"i18n_info": {
				"en": {"title": "Concerts"},
				"cs": {"title": "Koncerty"},
				"sk": {"title": "Koncerty"}
			},
			"icon": "fa-solid fa-guitar"
		},
		{
			"type": "dir",
			"url": "/FDocu",
			"id": "docu",
			"i18n_info": {
				"en": {"title": "Documentary"},
				"cs": {"title": "Dokumentární"},
				"sk": {"title": "Dokumentárne"}
			},
			"icon": "fa-solid fa-mountain-sun"
		},
		{
			"type": "dir",
			"url": "/FAnime",
			"id": "anime",
			"i18n_info": {
				"en": {"title": "Anime"},
				"cs": {"title": "Anime"},
				"sk": {"title": "Anime"}
			},
			"icon": "fa-solid fa-dragon"
		},
		// {
		// 	"type": "dir",
		// 	"url": "/FSport",
		// 	"id": "sport",
		// 	"i18n_info": {
		// 		"en": {"title": "Sport"},
		// 		"cs": {"title": "Sport"},
		// 		"sk": {"title": "Šport"}
		// 	},
		// 	"icon": "fa-solid fa-volleyball"
		// },
		{
			"type": "dir",
			"url": "/Search/getList",
			"i18n_info": {
				"en": {"title": "Lists / Charts"},
				"cs": {"title": "Seznamy / Řebríčky"},
				"sk": {"title": "Zoznamy / Rebríčky"}
			},
			"icon": "fa-solid fa-list-ul"
		},
		{
			"type": "dir",
			"id": "generator",
			"action": "generator",
			"i18n_info": {
				"en": {"title": "Random episode"},
				"cs": {"title": "Náhodná epizóda"},
				"sk": {"title": "Náhodná epizoda"}
			},
			"icon": "fa-solid fa-shuffle"
		}
	],
	"system": {
		"setContent": "files"
	}
}

export const moviesAdditionalLinks = [
	{
		"type": "dir",
		"url": "/FTv/archiv",
		"i18n_info": {
			"en": {"title": "TV Program (14 days)"},
			"cs": {"title": "TV Program (14 dní)"},
			"sk": {"title": "TV Program (14 dní)"}
		}
	},
	{
		"type": "dir",
		"url": "/FHDR",
		"i18n_info": {
			"en": {"title": "HDR Videos"},
			"cs": {"title": "HDR videá"},
			"sk": {"title": "HDR videá"}
		}
	}
]