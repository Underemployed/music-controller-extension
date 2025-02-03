chrome.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-play") {
        try {
            const data = await chrome.storage.local.get(['ytmusic-enabled', 'youtube-enabled', 'spotify-enabled']);
            const tabs = await chrome.tabs.query({});

            for (const tab of tabs) {
                // skip if no URL or if it's a chrome
                if (!tab.url || tab.url.startsWith('chrome://') || !tab.id) continue;

                if (data['ytmusic-enabled'] && tab.url.includes('music.youtube.com')) {
                    await executeYouTubeControl(tab.id);
                }
                else if (data['youtube-enabled'] && tab.url.includes('youtube.com') && !tab.url.includes('music.youtube.com')) {
                    await executeYouTubeControl(tab.id);
                }
                else if (data['spotify-enabled'] && tab.url.includes('spotify.com')) {
                    await executeSpotifyControl(tab.id);
                }
            }
        } catch (error) {
            console.error('Error in command handler:', error);
        }
    }
});

async function executeYouTubeControl(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const video = document.querySelector('video');
                const playButton = document.querySelector('.ytp-play-button');

                if (video) {
                    if (video.paused) {
                        video.play().catch(() => {
                            if (playButton) playButton.click();
                        });
                    } else {
                        video.pause();
                    }
                } else if (playButton) {
                    playButton.click();
                }
            }
        });
    } catch (error) {
        console.error(`Error controlling YouTube (tab ${tabId}):`, error);
    }
}

async function executeSpotifyControl(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const playButton = document.querySelector('[data-testid="play-button"]');
                const pauseButton = document.querySelector('[data-testid="pause-button"]');
                if (pauseButton) {
                    pauseButton.click();
                } else if (playButton) {
                    playButton.click();
                }
            }
        });
    } catch (error) {
        console.error(`Error controlling Spotify (tab ${tabId}):`, error);
    }
}