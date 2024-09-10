# VideoDB

A Vue3 PWA client to browse the database of a Kodi video add-on.

- custom router with History API
- multiple languages
- dark/light mode
- keyboard shortcuts
- play/enqueue video shortcut in PWA on macOS (IINA), iOS/Android (VLC), Windows (VLC, PotPlayer) + custom protocols for VLC on Windows (play and enqueue video)
- favorites
- bookmarks
- history of played movies/shows
- import/export of data (settings, history, favs, bookmarks)
- touch events for modals (close modal, prev/next media)

## required *.env* variables
- **VITE_PLUGIN_URL** - plugin database URL
- **VITE_SERVICE_URL** - service for getting play/download links

The **Screenshots** folder contains previews of the UI.

## ToDo
- refactoring