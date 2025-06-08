# VideoDB

A Vue3 PWA client to browse the database of a Kodi video add-on.

- custom router with History API
- multiple languages
- dark/light mode
- keyboard shortcuts
- play/enqueue video shortcut in PWA on macOS (IINA), iOS (VLC, NPlayer), Android (MPV, VLC), Windows (VLC, PotPlayer) + custom protocols for VLC on Windows (play and enqueue video)
- favorites
- bookmarks
- history of played movies/shows
- import/export of data (settings, history, favs, bookmarks)
- touch events for modals (close modal, prev/next media)
- sync of history, bookmarks and favs + QR code generator and QR code camera scanner for easier setup

## required *.env* variables
- **VITE_PLUGIN_URL** - plugin database URL
- **VITE_SERVICE_URL** - service for getting play/download links
- **VITE_DOWNLOAD_SERVICE_URL** - PHP server URL
- **VITE_SITE_URL** - site URL
- **VITE_DEFAULT_POSTER** - placeholder poster image

The **Screenshots** folder contains previews of the UI.

## ToDo
- refactoring

## Update 05-06/25
- updated search
- updated scripts for fetching data and login
- new supported players (iOS, Android)
- updated UI + new layouts for movies/seasons/episodes page
- added Sync function (synchronize watched, favorites, bookmarks), QR code generator and scanner for easier setup
- added PHP scripts (proxy for fetching data, link shortener, sync...)
- support for casting links to Chromecast (disabled due to file format)
- bugfixes + optimizations