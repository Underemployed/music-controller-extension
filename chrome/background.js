chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-play") {
        chrome.storage.local.get(['ytmusic-enabled', 'youtube-enabled', 'spotify-enabled'], (data) => {
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    // YouTube Music control
                    if (data['ytmusic-enabled'] && tab.url.includes('music.youtube.com')) {
                        executePlayPause(tab);
                    }
                    // YouTube control
                    if (data['youtube-enabled'] && tab.url.includes('youtube.com') && !tab.url.includes('music.youtube.com')) {
                        executePlayPause(tab);
                    }
                    // Spotify control
                    if (data['spotify-enabled'] && tab.url.includes('spotify')) {
                        executeSpotifyPlayPause(tab);
                    }
                });
            });
        });
    }
});

function executePlayPause(tab) {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
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
        }
    });
}

function executeSpotifyPlayPause(tab) {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const playButton = document.querySelector('[data-testid="play-button"]');
            const pauseButton = document.querySelector('[data-testid="pause-button"]');
            if (playButton) playButton.click();
            if (pauseButton) pauseButton.click();
        }
    });
}
