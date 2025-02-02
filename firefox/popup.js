document.addEventListener('DOMContentLoaded', () => {
    const services = ['ytmusic', 'youtube', 'spotify'];

    // Load initial states
    browser.storage.local.get(services.map(s => `${s}-enabled`), (data) => {
        services.forEach(service => {
            const toggle = document.getElementById(`${service}-toggle`);
            if (toggle) {
                toggle.checked = data[`${service}-enabled`] === true;

                // Add change listener
                toggle.addEventListener('change', (e) => {
                    const setting = {};
                    setting[`${service}-enabled`] = e.target.checked;
                    browser.storage.local.set(setting);
                });
            }
        });
    });
});
