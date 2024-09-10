import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

const localStorageTheme = JSON.parse(localStorage.getItem('theme'))
if (localStorageTheme == 'light') {
	document.documentElement.classList.add('theme-light');
	document.querySelector('meta[name="theme-color"]').setAttribute('content', 'hsl(193, 40%, 92%)');
} else if (localStorageTheme == 'dark') {
	document.documentElement.classList.add('theme-dark');
	document.querySelector('meta[name="theme-color"]').setAttribute('content', 'hsl(193, 40%, 10%)');
} else if (!localStorageTheme && window.matchMedia('(prefers-color-scheme: light)').matches) {
	document.querySelector('meta[name="theme-color"]').setAttribute('content', 'hsl(193, 40%, 92%)');
}

createApp(App).mount('#app')

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register('/sw.js')
}