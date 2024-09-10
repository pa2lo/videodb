import { computed } from "vue"
import { lang } from "./store"

const labels = {
	sk: {
		"SC Login": "SC Prihlásenie",
		"Username": "Prihlasovacie meno",
		"Password": "Heslo",
		"Login": "Prihlásiť",
		"Back": "Späť",
		"Remove from favorites": "Odobrať z obľúbených",
		"Remove from bookmarks": "Odobrať zo záložiek",
		"Add to favorites": "Pridať do obľúbených",
		"Add to bookmarks": "Pridať do záložiek",
		"Settings": "Nastavenia",
		"Help": "Pomocník",
		"Logout": "Odhlásiť",
		"Random episode": "Náhodná epizóda",
		"Find next episode": "Nájdi ďalšiu epizódu",
		"Play": 'Prehrať',
		"Download": "Stiahnuť",
		"Open": "Otvoriť",
		"Add to playlist": "Pridať do playlistu",
		"Copy link": "Kopírovať odkaz",
		"Last generated": "Posledne generované",
		"Video information": "Informácie o videu",
		"No informations": "Žiadne informácie",
		"Select stream": "Výber streamu",
		"Previous episode": "Predchádzajúca epizóda",
		"Next episode": "Ďalšia epizóda",
		"Previous video": "Predchádzajúce video",
		"Next video": "Ďalšia video",
		"Season": "Séria",
		"Remove from watch list": "Odstrániť zo zoznamu videných",
		"Director": "Režisér",
		"Stars": "Hrajú",
		"Search": "Hľadať",
		"Search text...": "Hľadať text...",
		"Home": "Domov",
		"Page": "Strana",
		"Refresh page": "Obnoiť stránku",
		"Error loading ID": "Nepodarilo sa získať ID",
		"Error loading URL": "Nepodarilo sa získať URL",
		"Remember me": "Zapamätať si ma",
		"Type": "Typ",
		"Movies": "Filmy",
		"Series": "Seriály",
		"Genre": "Žáner",
		"Order": "Zoradenie",
		"Random": "Náhodné",
		"Name": "Názov",
		"Newest streams": "Najnovšie streamy",
		"Min rating": "Najnižšie hodnotenie",
		"Year from": "Od roku",

		// toasts
		"Video removed from favorites": "Video odobrané z obľúbených",
		"Page removed from bookmarks": "Stránka odobraná zo záložiek",
		"Series removed from favorites": "Seriál odobraný z obľúbených",
		"Video added to favorites": "Video pridané do obľúbených",
		"Page added to bookmarks": "Stránka pridaná do záložiek",
		"Series added to favorites": "Seriál pridaný do obľúbených",
		"Series added to bookmarks": "Seriál pridaný do záložiek",
		"The folder is empty": "Priečinok je prázdny",
		"Error loading data": "Chyba pri načítavaní dát",
		"Request timeout": "Časový limit vypršal",
		"Link copied to clipboard": "Link skopírovaný do schránky",
		"Video removed from watch list": "Video odobrané zo zoznamu videných",

		// settings
		"List order": "Zoradenie zoznamu",
		"Default": "Predvolené",
		"Rating": "Hodnotenie",
		"Year": "Rok",
		"Length": "Dĺžka",
		"Language": "Jazyk",
		"Theme": "Téma",
		"Dark": "Tmavá",
		"Light": "Svetlá",
		"Dubbed only": "Iba dabované",
		"Yes": "Áno",
		"No": "Nie",
		"Random episode - stream quality": "Náhodná epizóda - kvalita streamu",
		"Low": "Nízka",
		"Medium": "Stredná",
		"High": "Vysoká",
		"Video player": "Prehrávač videí",
		"To play videos in VLC, you need to install protocols": "Pre spúšťanie videí vo VLC je potrebné nainštalovať protokoly",
		"Install VLC protocols": "Inštalovať VLC protokoly",
		"Remove VLC protocols": "Odstrániť VLC protokoly",
		"Homepage widgets": "Widgety na domovskej stránke",
		"Delete watched list": "Vymazať zoznam sledovaných videí",
		"Delete watched movies": "Vymazať sledované filmy",
		"Delete watched series": "Vymazať sledované seriály",
		"Delete favorites": "Vymazať obľúbené",
		"Delete bookmarks": "Vymazať záložky",
		"Delete Random episodes history": "Vymazať históriu náhodných epizód",
		"Watched list deleted": "Zoznam sledovaných vymazaný",
		"Watched series deleted": "Sledované seriály vymazané",
		"Watched movies deleted": "Sledované filmy vymazané",
		"Favorites deleted": "Obľúbené položky vymazané",
		"Bookmarks deleted": "Záložky vymazané",
		"Random episodes history deleted": "Históriu náhodných epizód vymazaná",
		"Export data": "Exportovať dáta",
		"Import data": "Importovať dáta",
		"Import will overwrite all data and settings. Are you sure you want to import data?": "Import prepíše všetky dáta a nastavenia. Naozaj chcete importovať dáta?",

		// help
		"Supported video players": "Podporované videoprehrávače",
		"Keyboard shortcuts": "Klávesové skratky",
		"General": "Všeobecné",
		"move through items": "pohyb po položkách",
		"first / last item": "prvá / posledná položka",
		"confirm selected item": "potvrdiť označenú položku",
		"close the popup window": "zavrieť okno",
		"add / remove from favorites": "pridať / odobrať z obľúbených",
		"CSFD page": "CSFD stránka",
		"IMDB page": "IMDB stránka",
		"previous / next video": "predchádzajúce / ďalšie video",
		"play / open": "prehrať / otvoriť",
		"stream selection": "výber streamu",
		"previous / next episode": "predchádzajúca / ďalšia epizóda",

		// install
		"Download App": "Stiahnuť aplikáciu",
		"Do you want to download <strong>VideoDB</strong> as app to your device?": "Chcete stiahnuť <strong>VideoDB</strong> ako aplikáciu do zariadenia?",
		"Cancel": "Zrušiť",
		"1. Press the \"Share\" button": "1. Stlačte tlačidlo \"Zdieľať\"",
		"2. Select \"Add to Home Screen\" from the popup": "2. V kontextovom okne vyberte možnosť \"Pridať na plochu\"",
		"3. Tap \"Add\" in the top right corner": "3. Klepnite na položku \"Pridať\" v pravom hornom rohu"
	},
	cs: {
		"SC Login": "SC Přihlášení",
		"Username": "Přihlašovací jméno",
		"Password": "Heslo",
		"Login": "Přihlásit",
		"Back": "Zpět",
		"Remove from favorites": "Odebrat z oblíbených",
		"Remove from bookmarks": "Odobrať ze záložek",
		"Add to favorites": "Přidat do oblíbených",
		"Add to bookmarks": "Přidat do záložek",
		"Settings": "Nastavení",
		"Help": "Pomocník",
		"Logout": "Odhlásit",
		"Random episode": "Náhodná epizoda",
		"Find next episode": "Najdi další epizodu",
		"Play": 'Přehrát',
		"Download": "Stáhnout",
		"Open": "Otevřít",
		"Add to playlist": "Přidat do playlistu",
		"Copy link": "Kopírovat odkaz",
		"Last generated": "Poslední generované",
		"Video information": "Informace o videu",
		"No informations": "Žádné informace",
		"Select stream": "Výběr streamu",
		"Previous episode": "Předchozí epizoda",
		"Next episode": "Další epizoda",
		"Previous video": "Předchozí video",
		"Next video": "Další video",
		"Season": "Série",
		"Remove from watch list": "Odstranit ze seznamu viděných",
		"Director": "Režisér",
		"Stars": "Hrají",
		"Search": "Hledat",
		"Search text...": "Hledat text...",
		"Home": "Domů",
		"Page": "Strana",
		"Refresh page": "Obnoit stránku",
		"Error loading ID": "Nepodařilo se získat ID",
		"Error loading URL": "Nepodařilo se získat URL",
		"Remember me": "Zapamatovat si mě",
		"Type": "Typ",
		"Movies": "Filmy",
		"Series": "Seriály",
		"Genre": "Žánr",
		"Order": "Seřazení",
		"Random": "Náhodné",
		"Name": "Název",
		"Newest streams": "Nejnovější streamy",
		"Min rating": "Nejnižší hodnocení",
		"Year from": "Od roku",

		// toasts
		"Video removed from favorites": "Video odebráno z oblíbených",
		"Page removed from bookmarks": "Stránka odebrána ze záložek",
		"Series removed from favorites": "Seriál odobrán z oblíbených",
		"Video added to favorites": "Video přidáno do oblíbených",
		"Page added to bookmarks": "Stránka přidána do záložek",
		"Series added to favorites": "Seriál přidán do oblíbených",
		"Series added to bookmarks": "Seriál přidán do záložek",
		"The folder is empty": "Složka je prázdná",
		"Error loading data": "Chyba při načítání dat",
		"Request timeout": "Časový limit vypršel",
		"Link copied to clipboard": "Link zkopírován do schránky",
		"Video removed from watch list": "Video odebrané ze seznamu viděných",

		// settings
		"List order": "Seřazení seznamu",
		"Default": "Výchozí",
		"Rating": "Hodnocení",
		"Year": "Rok",
		"Length": "Délka",
		"Language": "Jazyk",
		"Theme": "Téma",
		"Dark": "Tmavá",
		"Light": "Světla",
		"Dubbed only": "Pouze dabované",
		"Yes": "Ano",
		"No": "Ne",
		"Random episode - stream quality": "Náhodná epizoda - kvalita streamu",
		"Low": "Nízká",
		"Medium": "Střední",
		"High": "Vysoká",
		"Video player": "Přehrávač videí",
		"To play videos v VLC, budete potřebovat instalovat protokoly": "Pro spouštění videí ve VLC je třeba nainstalovat protokoly",
		"Install VLC protocols": "Instalovat VLC protokoly",
		"Remove VLC protocols": "Odstranit VLC protokoly",
		"Homepage widgets": "Widgety na domovské stránce",
		"Delete watched list": "Vymazat seznam sledovaných videí",
		"Delete watched movies": "Vymazat sledované filmy",
		"Delete watched series": "Vymazat sledované seriály",
		"Delete favorites": "Vymazat oblíbené",
		"Delete bookmarks": "Vymazat záložky",
		"Delete Random episodes history": "Vymazat historii náhodných epizod",
		"Watched list deleted": "Seznam sledovaných vymazán",
		"Watched series deleted": "Sledované seriály vymazány",
		"Watched movies deleted": "Sledované filmy vymazány",
		"Favorites deleted": "Oblíbené položky vymazány",
		"Bookmarks deleted": "Záložky vymazány",
		"Random episodes history deleted": "Historie náhodných epizod vymazána",
		"Export data": "Exportovat data",
		"Import data": "Importovat data",
		"Import will overwrite all data and settings. Are you sure you want to import data?": "Import přepíše všechna data a nastavení. Opravdu chcete importovat data??",

		// help
		"Supported video players": "Podporované videopřehrávače",
		"Keyboard shortcuts": "Klávesové zkratky",
		"General": "Obecné",
		"move through items": "pohyb po položkách",
		"first / last item": "první / poslední položka",
		"confirm selected item": "potvrdit označenou položku",
		"close the popup window": "zavřít okno",
		"add / remove from favorites": "přidat / odebrat z oblíbených",
		"CSFD page": "CSFD stránka",
		"IMDB page": "IMDB stránka",
		"previous / next video": "předchozí / další video",
		"play / open": "přehrát / otevřít",
		"stream selection": "výběr streamu",
		"previous / next episode": "předchozí / další epizoda",

		// install
		"Download App": "Stáhnout aplikaci",
		"Do you want to download <strong>VideoDB</strong> as app to your device?": "Chcete stáhnout <strong>VideoDB</strong> jako aplikaci do zařízení?",
		"Cancel": "Zrušit",
		"1. Press the \"Share\" button": "1. Stiskněte tlačítko \"Sdílet\"",
		"2. Select \"Add to Home Screen\" from the popup": "2. Z vyskakovacího okna vyberte \"Přidat na domovskou obrazovku\"",
		"3. Tap \"Add\" in the top right corner": "3. Klepněte na \"Přidat\" v pravém horním rohu"
	}
}

const currentLabels = computed(() => labels[lang.value]);

export function t(label, l) {
	return l ? labels[l]?.[label] || label : currentLabels.value?.[label] || label
}