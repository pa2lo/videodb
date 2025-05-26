<script setup>
import { t } from '@/labels'

const buildTime = __BUILD_TIMESTAMP__;
</script>

<template>
	<div class="searchCont">
		<h3>{{ t('Supported video players') }}</h3>
		<div class="smallerLine preventBoost"><i class="fa-brands fa-android fa-fw"></i> Android - <a href="https://play.google.com/store/apps/details?id=org.videolan.vlc/" target="_blank" rel="noopener noreferrer">VLC</a> / <a href="https://play.google.com/store/apps/details?id=is.xyz.mpv" target="_blank" rel="noopener noreferrer">MPV</a></div>
		<div class="preventBoost"><i class="fa-brands fa-apple fa-fw"></i> iOS - <a href="https://apps.apple.com/us/app/vlc-media-player/id650377962/" target="_blank" rel="noopener noreferrer">VLC</a> / <a href="https://apps.apple.com/us/app/nplayer-lite/id1078835991/" target="_blank" rel="noopener noreferrer">NPlayer</a></div>
		<div class="preventBoost"><i class="fa-brands fa-apple fa-fw"></i> Mac - <a href="https://iina.io/" target="_blank" rel="noopener noreferrer">IINA</a></div>
		<div class="preventBoost"><i class="fa-brands fa-windows fa-fw"></i> Windows - <a href="https://potplayer.daum.net/" target="_blank" rel="noopener noreferrer">PotPlayer</a> / <a href="https://www.videolan.org/" target="_blank" rel="noopener noreferrer">VLC</a></div>
		<div class="baseLine">
			<h3>{{ t('Keyboard shortcuts') }}</h3>

			<h4 class="smallerLine">{{ t('General') }}</h4>
			<div class="smallLine keyInfo">
				<strong><i class="fa-solid fa-arrow-up fa-fw"></i></strong>
				<strong><i class="fa-solid fa-arrow-down fa-fw"></i></strong>
				<strong><i class="fa-solid fa-arrow-left fa-fw"></i></strong>
				<strong><i class="fa-solid fa-arrow-right fa-fw"></i></strong>
				- {{ t('move through items') }}
			</div>
			<div class="keyInfo">
				<strong class="longKey">Home</strong>
				<strong class="longKey">End</strong>
				- {{ t('first / last item') }}
			</div>
			<div class="keyInfo">
				<strong class="longKey">Enter</strong>
				- {{ t('confirm selected item') }}
			</div>
			<div class="keyInfo">
				<strong class="longKey">Esc</strong>
				- {{ t('Home') }} / {{ t('close the popup window') }}
			</div>
			<div class="keyInfo">
				<strong class="longKey">Backspace</strong>
				- {{ t('Back') }} / {{ t('close the popup window') }}
			</div>
			<div class="keyInfo">
				<strong>B</strong>
				- {{ t('Add to bookmarks') }}
			</div>
			<div class="keyInfo">
				<strong>I</strong>
				- {{ t('Video information') }}
			</div>
			<div class="keyInfo">
				<strong>W</strong>
				- {{ t('Remove from watch list') }}
			</div>
			<div class="keyInfo">
				<strong>F</strong>
				- {{ t('add / remove from favorites') }}
			</div>
			<div class="keyInfo">
				<strong>C</strong>
				- {{ t('CSFD page') }}
			</div>
			<div class="keyInfo">
				<strong>M</strong>
				- {{ t('IMDB page') }}
			</div>

			<h4 class="smallerLine">Popup - {{ t('Video information') }}</h4>
			<div class="smallLine keyInfo">
				<strong><i class="fa-solid fa-arrow-left fa-fw"></i></strong>
				<strong><i class="fa-solid fa-arrow-right fa-fw"></i></strong>
				- {{ t('previous / next video') }}
			</div>
			<div class="keyInfo">
				<strong class="longKey">Enter</strong>
				- {{ t('play / open') }}
			</div>
			<div class="keyInfo">
				<strong>W</strong>
				- {{ t('Remove from watch list') }}
			</div>
			<div class="keyInfo">
				<strong>F</strong>
				- {{ t('add / remove from favorites') }}
			</div>
			<div class="keyInfo">
				<strong>C</strong>
				- {{ t('CSFD page') }}
			</div>
			<div class="keyInfo">
				<strong>M</strong>
				- {{ t('IMDB page') }}
			</div>

			<h4 class="smallerLine">Popup - {{ t('Select stream') }}</h4>
			<div class="smallLine keyInfo">
				<strong><i class="fa-solid fa-arrow-up fa-fw"></i></strong>
				<strong><i class="fa-solid fa-arrow-down fa-fw"></i></strong>
				- {{ t('stream selection') }}
			</div>
			<div class="keyInfo">
				<strong><i class="fa-solid fa-arrow-left fa-fw"></i></strong>
				<strong><i class="fa-solid fa-arrow-right fa-fw"></i></strong>
				- {{ t('previous / next episode') }}
			</div>
			<div class="keyInfo">
				<strong>P</strong>
				- {{ t('Play') }}
			</div>
			<div class="keyInfo">
				<strong>D</strong>
				- {{ t('Download') }}
			</div>
			<div class="keyInfo">
				<strong>C</strong>
				- {{ t('Copy link') }}
			</div>
			<div class="keyInfo">
				<strong>Q</strong>
				- {{ t('Add to playlist') }}
			</div>
			<div class="keyInfo">
				<strong>W</strong>
				- {{ t('Remove from watch list') }}
			</div>

			<h4 class="smallerLine">{{ t('Random episode') }}</h4>
			<div class="smallLine keyInfo">
				<strong class="longKey">Enter</strong>
				<strong>F</strong>
				- {{ t('Find next episode') }}
			</div>
			<div class="keyInfo">
				<strong>P</strong>
				- {{ t('Play') }}
			</div>
			<div class="keyInfo">
				<strong>D</strong>
				- {{ t('Download') }}
			</div>
			<div class="keyInfo">
				<strong>C</strong>
				- {{ t('Copy link') }}
			</div>
			<div class="keyInfo">
				<strong>Q</strong>
				- {{ t('Add to playlist') }}
			</div>
		</div>
		<div class="settingsDivider line"></div>
		<div class="baseLine">Build: {{ buildTime }}</div>
	</div>
</template>