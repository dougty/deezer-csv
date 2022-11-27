(function() {
	const trackNums = {}
	const uniqueNames = []
	const songs = []

	let lastScroll = Date.now()
	let lastOffset = 0
	let offset = 0
	$('html').scrollTop(0)
	const scrollInterval = setInterval(() => {
		$('html').scrollTop(offset)
		offset += 50

		if (window.scrollY != lastOffset) {
			console.log('scrolling...')
			lastScroll = Date.now()
			lastOffset = window.scrollY
		} else {
			console.log('waiting...')
		}

		if (Date.now() > lastScroll + 1000) {
			clearInterval(scrollInterval)
			console.log('end reached')
			table.unbind('DOMNodeInserted DOMNodeRemoved', getSongs)
			createCSV()
		}
	}, 100)

	const playlistTitle = $('html').find('[data-testid="masthead-title"]').text()

	const table = $('.catalog-content .container')
	table.bind('DOMNodeInserted DOMNodeRemoved', getSongs)
	getSongs()

	function getSongs() {
		table.find('*[aria-rowindex]').each((i, row) => {
			const rowNum = $(row).attr('aria-rowindex')
			if (trackNums[rowNum] !== true) {
				trackNums[rowNum] = true
				const song = {
					index: rowNum,
					title: $(row).find('[data-testid=title]').text(),
					artist: $(row).find('[data-testid=artist]').text(),
					album: $(row).find('[data-testid=album]').text(),
				}
				songs.push(song)

				if (uniqueNames.indexOf(song.title) == -1) {
					uniqueNames.push(song.title)
				}
			}
		})
	}

	function createCSV() {
		songs.sort((s1, s2) => {
			return s1.index - s2.index
		})
		console.log('number of songs: ' + songs.length)
		console.log('unique titles: ' + uniqueNames.length)

		if (uniqueNames.length != songs.length) {
			console.log('WARNING: title number mismatch!\nmay not have found all songs\n(or there are duplicates)')
		}

		let str = 'Title, Artist, Album\n'
		for (let i=0; i < songs.length; i++) {
			const song = songs[i]
			str += `"${song.title}", "${song.artist}", "${song.album}"\n`
		}

		downloadText(`playlist_${playlistTitle}.csv`, str)
	}

	function downloadText(fn, str) {
		const el = document.createElement('a')
		el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(str))
		el.setAttribute('download', fn)
		el.click()
	}
})()
