   


document.addEventListener('DOMContentLoaded', () => {
    const services = ['ytmusic', 'youtube', 'spotify'];
    const setting = {};

        services.forEach(service => {
            loadSavedStates(service).then(() => {
                loadServiceTabs(service);
                setupServiceToggle(service);
            });
        });
        console.log('Popup initialized');
    });

    // Load saved states for a service and update the toggle state
    async function loadSavedStates(service) {
        const data = await browser.storage.local.get(`${service}-tabs`);
        const serviceToggle = document.getElementById(`${service}-toggle`);
        const tabStates = data[`${service}-tabs`] || {};

        const hasEnabledTabs = Object.values(tabStates).some(state => state);
        if (hasEnabledTabs) {
            serviceToggle.classList.add('active');
        }
    }

// Setup the toggle button for tabs
    
    function setupServiceToggle(service) {
        const toggle = document.getElementById(`${service}-toggle`);



        toggle.addEventListener('click', async () => {
            toggle.classList.toggle('active');
            const isActive = toggle.classList.contains('active');
            console.log(`${service} toggle clicked, active: ${isActive}`);

            const tabs = await browser.tabs.query({});
            const matchingTabs = filterTabsByService(tabs, service);
            const tabSettings = {};
            matchingTabs.forEach(tab => {
                tabSettings[tab.id] = isActive;
            });

            const update = {};
            update[`${service}-tabs`] = tabSettings;
            await browser.storage.local.set(update);

            const tabToggles = document.querySelectorAll(`#${service}-tabs .tab-toggle input`);
            tabToggles.forEach(toggle => {
                toggle.checked = isActive;
                toggle.closest('.tab-toggle').classList.toggle('disabled', !isActive);
            });
        });
    }

    // Load tabs for a service and create toggles for each tab
function loadServiceTabs(service) {
    browser.tabs.query({}, (tabs) => {
        const tabContainer = document.getElementById(`${service}-tabs`);
        const matchingTabs = filterTabsByService(tabs, service);

        browser.storage.local.get([`${service}-tabs`], (data) => {
            const tabSettings = data[`${service}-tabs`] || {};
            const serviceToggle = document.getElementById(`${service}-toggle`);
            const isServiceActive = serviceToggle.classList.contains('active');

            matchingTabs.forEach(tab => {
                const isEnabled = tabSettings.hasOwnProperty(tab.id) ?
                    tabSettings[tab.id] : true;
                console.log(`Tab ${tab.id} state: ${isEnabled}`);

                const tabToggle = createTabToggle(tab, service, isEnabled);
                tabContainer.appendChild(tabToggle);
            });
        });
    });
}



    // Create a toggle element for a tab
    function createTabToggle(tab, service, savedState = true) {
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'tab-toggle';
        if (!savedState) {
            toggleDiv.classList.add('disabled');
        }

        const label = document.createElement('span');
        let cleanTitle = tab.title;
        if (cleanTitle.length > 38) {
            cleanTitle = cleanTitle.substring(0, 38).trim() + '...';
        }
        label.textContent = cleanTitle;
        label.className = 'tab-title';

        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = savedState;

        const slider = document.createElement('span');
        slider.className = 'slider';

        input.addEventListener('change', (e) => {
            console.log(`Tab ${cleanTitle} toggle: ${e.target.checked}`);
            toggleDiv.classList.toggle('disabled', !e.target.checked);
            updateTabState(service, tab.id, e.target.checked);
        });

        switchLabel.appendChild(input);
        switchLabel.appendChild(slider);
        toggleDiv.appendChild(label);
        toggleDiv.appendChild(switchLabel);

        return toggleDiv;
    }

    // Update the state of a tab in storage
    async function updateTabState(service, tabId, enabled) {
        const data = await browser.storage.local.get(`${service}-tabs`);
        const tabStates = data[`${service}-tabs`] || {};
        tabStates[tabId] = enabled;

        const update = {};
        update[`${service}-tabs`] = tabStates;
        await browser.storage.local.set(update);
        console.log(`Updated ${service} tab ${tabId} state: ${enabled}`);

        const hasEnabledTabs = Object.values(tabStates).some(state => state);
        const serviceToggle = document.getElementById(`${service}-toggle`);
        serviceToggle.classList.toggle('active', hasEnabledTabs);
    }

    function filterTabsByService(tabs, service) {
        const patterns = {
            'ytmusic': 'music.youtube.com',
            'youtube': 'www.youtube.com',
            'spotify': 'open.spotify.com'
        };
        return tabs.filter(tab => tab.url.includes(patterns[service]));
    }