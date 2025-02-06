browser.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-play") {
        console.log('Toggle play command received');
        const data = await browser.storage.local.get(null);
        const tabs = await browser.tabs.query({});

        // Handle Spotify separately - only first enabled tab
        const spotifyTab = tabs.find(tab =>
            tab.url.includes('spotify') &&
            (data['spotify-tabs'] || {})[tab.id]
        );
        if (spotifyTab) {
            console.log('Executing Spotify play/pause');
            await executeSpotifyPlayPause(spotifyTab);
        }

        // Handle YouTube and YouTube Music 
        for (const tab of tabs) {
            if (tab.url.includes('music.youtube.com')) {
                const ytmusicTabs = data['ytmusic-tabs'] || {};
                if (ytmusicTabs[tab.id]) {
                    console.log('Executing YT Music play/pause',tab.id);
                    await executePlayPause(tab);
                }
            } else if (tab.url.includes('www.youtube.com')) {
                const youtubeTabs = data['youtube-tabs'] || {};
                if (youtubeTabs[tab.id]) {
                    console.log('Executing YouTube play/pause',tab.id);
                    await executeYoutubePlayPause(tab);
                }
                
            }
        }
    }
});

async function executePlayPause(tab) {
    await browser.tabs.executeScript(tab.id, {
        code: `
            (function() {
                let video = document.querySelector('video');
                if (video) {
                    if (video.paused) {
                        video.play().catch(e => {
                            const playButton = document.querySelector('.ytp-play-button');
                            if (playButton) playButton.click();
                        });
                    } else {
                        video.pause();
                    }
                }
            })();
        `
    });
}

async function executeSpotifyPlayPause(tab) {
    await executeSpaceKey(tab);
}

async function executeSpaceKey(tab) {
    await browser.tabs.executeScript(tab.id, {
        code: `
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: ' ', keyCode: 32, code: 'Space',
                which: 32, bubbles: true, cancelable: true
            }));
        `
    });
}

async function executeYoutubePlayPause(tab) {
    await browser.tabs.executeScript(tab.id, {
        code: `
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'k', 
                keyCode: 75, 
                code: 'KeyK',
                which: 75, 
                bubbles: true, 
                cancelable: true
            }));
        `
    });
}