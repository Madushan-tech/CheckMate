document.addEventListener('DOMContentLoaded', () => {
    const phoneScreen = document.querySelector('.screen');
    const lockScreen = document.querySelector('.lock-screen');
    const homeScreen = document.querySelector('.home-screen');
    const powerButton = document.querySelector('.power-button');
    const statusBarTimeElements = document.querySelectorAll('.status-bar .time');
    const lockScreenLargeTimeElement = document.querySelector('.lock-screen-content .large-time');
    const lockScreenAmPmElement = document.querySelector('.lock-screen-content .am-pm');
    const lockScreenDateElement = document.querySelector('.lock-screen-content .date');
    const notificationsContainer = lockScreen.querySelector('.notifications');
    const appPages = document.querySelectorAll('.app-grid');
    const pageDots = document.querySelectorAll('.page-indicator .dot');
    const navHomeButton = document.querySelector('.nav-home');
    // const navBackButton = document.querySelector('.nav-back'); // For future use
    // const navRecentsButton = document.querySelector('.nav-recents'); // For future use
    const notificationPanel = document.querySelector('.notification-panel');
    const mainStatusBarElements = document.querySelectorAll('.status-bar'); // All status bars
    const quickSettingTiles = document.querySelectorAll('.quick-setting-tile');
    const panelTimeDateElement = document.querySelector('.panel-time-date');
    const panelNotificationsList = notificationPanel ? notificationPanel.querySelector('.notifications-list') : null;
    const clearAllButton = notificationPanel ? notificationPanel.querySelector('.clear-all-notifications') : null;
    const fingerprintSensor = document.querySelector('.fingerprint-icon');


    let isScreenOn = false; // Default: Screen is OFF
    let isLocked = true;    // Default: Phone is LOCKED (when it turns on)
    let currentPage = 0;

    // --- Power Button Functionality ---
    powerButton.addEventListener('click', () => {
        if (!isScreenOn) {
            // Screen is currently OFF, so turn it ON to the lock screen
            isScreenOn = true;
            isLocked = true; // Always go to lock screen when turning "on" with power button

            phoneScreen.style.backgroundColor = 'transparent'; // Lock screen has its own background
            lockScreen.classList.remove('hidden');
            homeScreen.classList.remove('active'); // Ensure home screen is not shown

            updateTime(); // Ensure time is current & visible
            // Welcome notification is handled by opening the panel, not directly by power button.
        } else {
            // Screen is currently ON (either lock or home), so turn it OFF
            isScreenOn = false;
            phoneScreen.style.backgroundColor = '#000'; // Set screen to black
            lockScreen.classList.add('hidden');
            homeScreen.classList.remove('active'); // Ensure home screen is also hidden
            if (notificationPanel && notificationPanel.classList.contains('open')) {
                closeNotificationPanel(); // Close panel if it's open when screen turns off
            }
            // No need to update time if screen is turning off
        }
    });

    // --- Notification Display in Panel ---
    function displayWelcomeNotification() { // This will now add to the panel list
        if (!panelNotificationsList) return;

        // Clear old lock screen notifications if any (or stop populating them)
        if (notificationsContainer) notificationsContainer.innerHTML = '';

        // Example notification data (can be made more generic)
        const notificationData = {
            appIcon: 'phone_missed', // Material icon name
            iconColor: '#fb923c', // Orange-400 like
            appName: 'Phone',
            timeSince: '2m', // Placeholder
            title: '071 547 9078',
            text: 'Missed call • On Silent mode',
            expandIcon: 'expand_more'
        };

        addNotificationToPanel(notificationData);
    }

    function addNotificationToPanel(data) {
        if (!panelNotificationsList) return;

        const item = document.createElement('div');
        item.classList.add('notification-item');
        item.innerHTML = `
            <span class="material-icons app-icon-sm" style="color: ${data.iconColor || '#fff'};">${data.appIcon}</span>
            <div class="notification-item-content">
                <div class="notification-item-header">
                    <span class="app-name-time">
                        <span class="app-name">${data.appName}</span> • <span class="time-since">${data.timeSince}</span>
                    </span>
                </div>
                <div class="notification-item-title">${data.title}</div>
                <div class="notification-item-text">${data.text}</div>
            </div>
            <span class="material-icons expand-icon">${data.expandIcon}</span>
        `;
        panelNotificationsList.prepend(item); // Add new notifications to the top
    }

    // --- Time Display ---
    function updateTime() {
        // Only update time if the screen is conceptually "on".
        // The actual visibility of time elements depends on whether lock screen or home screen is active.
        if (!isScreenOn) {
            // If screen is off, don't bother calculating time.
            // Exception: if power button was just pressed to turn screen off,
            // this function might be called once more before visual elements are hidden.
            // This is generally fine.
            return;
        }

        const now = new Date();
        const targetTimezoneOffset = 5.5 * 60; // +5:30 in minutes
        const localTimezoneOffset = now.getTimezoneOffset(); // User's local timezone offset in minutes
        const totalOffset = targetTimezoneOffset + localTimezoneOffset;

        const targetDate = new Date(now.getTime() + totalOffset * 60 * 1000);

        let hours = targetDate.getUTCHours();
        const minutes = targetDate.getUTCMinutes().toString().padStart(2, '0');
        const currentAmPm = targetDate.getUTCHours() >= 12 ? 'PM' : 'AM';
        let currentHours = targetDate.getUTCHours() % 12;
        currentHours = currentHours ? currentHours : 12; // the hour '0' should be '12'

        // Status bar time format (e.g., "4:14 PM")
        const statusBarFormattedTime = `${currentHours}:${minutes} ${currentAmPm}`;
        statusBarTimeElements.forEach(el => el.textContent = statusBarFormattedTime);

        // Large lock screen time format (e.g., "4:14")
        if (lockScreenLargeTimeElement) {
            lockScreenLargeTimeElement.textContent = `${currentHours}:${minutes}`;
        }
        if (lockScreenAmPmElement) {
            lockScreenAmPmElement.textContent = currentAmPm;
        }

        // Date format (e.g., "Sat, Jun 28")
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayName = days[targetDate.getUTCDay()];
        const monthName = months[targetDate.getUTCMonth()];
        const dayOfMonth = targetDate.getUTCDate();
        const formattedDate = `${dayName}, ${monthName} ${dayOfMonth}`;

        if (lockScreenDateElement) {
            lockScreenDateElement.textContent = formattedDate;
        }

        // Update time in notification panel header
        if (panelTimeDateElement && notificationPanel && notificationPanel.classList.contains('open')) {
            // Format: 4:15 PM 06/28/2025 (from design)
            const panelDateStr = `${(targetDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${dayOfMonth.toString().padStart(2, '0')}/${targetDate.getUTCFullYear()}`;
            panelTimeDateElement.textContent = `${statusBarFormattedTime} ${panelDateStr}`;
        }
    }
    setInterval(updateTime, 1000); // Update time every second

    // --- Lock Screen Functionality ---
    lockScreen.addEventListener('swiped-right', () => { // Assuming a swipe library or custom event
        if (isScreenOn && isLocked) {
            unlockScreen();
        }
    });

    // Basic swipe detection for lock screen (placeholder)
    let lockTouchStartX = 0;
    lockScreen.addEventListener('touchstart', (e) => {
        lockTouchStartX = e.touches[0].clientX;
    }, { passive: true });

    lockScreen.addEventListener('touchend', (e) => {
        if (!isScreenOn || !isLocked) return;
        const touchEndX = e.changedTouches[0].clientX;
        if (touchEndX - lockTouchStartX > 100) { // Swipe right threshold
            unlockScreen();
        }
    }, { passive: true });


    function unlockScreen() {
        isLocked = false;
        lockScreen.classList.add('hidden');
        homeScreen.classList.add('active');
        phoneScreen.style.backgroundColor = 'transparent'; // Home screen also uses its own background image
        showPage(currentPage);
        updateTime(); // Ensure time is updated on home screen
    }

    // --- App Page Navigation ---
    function showPage(pageIndex) {
        appPages.forEach((page, index) => {
            page.classList.toggle('active', index === pageIndex);
            if (index === pageIndex) {
                page.style.transform = 'translateX(0%)';
                page.style.opacity = '1';
            } else if (index < pageIndex) {
                page.style.transform = 'translateX(-100%)';
                page.style.opacity = '0';
            } else {
                page.style.transform = 'translateX(100%)';
                page.style.opacity = '0';
            }
        });
        pageDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === pageIndex);
        });
        currentPage = pageIndex;
    }

    pageDots.forEach(dot => {
        dot.addEventListener('click', () => {
            if (isScreenOn && !isLocked) {
                const pageIndex = parseInt(dot.dataset.page);
                showPage(pageIndex);
            }
        });
    });

    // Swipe navigation for app pages
    let homeTouchStartX = 0;
    homeScreen.addEventListener('touchstart', (e) => {
        // Only capture if the touch is on an app-grid or the page indicator area
        if (e.target.closest('.app-grid') || e.target.closest('.page-indicator')) {
            homeTouchStartX = e.touches[0].clientX;
        } else {
            homeTouchStartX = null; // Reset if touch starts outside swipeable area
        }
    }, { passive: true });

    homeScreen.addEventListener('touchend', (e) => {
        if (!isScreenOn || isLocked || homeTouchStartX === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const swipeThreshold = 50; // Minimum pixels for a swipe

        if (homeTouchStartX - touchEndX > swipeThreshold) { // Swiped left
            if (currentPage < appPages.length - 1) {
                showPage(currentPage + 1);
            }
        } else if (touchEndX - homeTouchStartX > swipeThreshold) { // Swiped right
            if (currentPage > 0) {
                showPage(currentPage - 1);
            }
        }
        homeTouchStartX = 0; // Reset
    }, { passive: true });


    // --- Initialize ---
    // Add some dummy apps for testing
    const page0Grid = document.querySelector('.app-grid.page-0');
    const page1Grid = document.querySelector('.app-grid.page-1');
    const dock = document.querySelector('.dock');

    const sampleAppsPage0 = [
        { name: 'Messages', icon: '✉️' }, { name: 'Photos', icon: '🖼️' },
        { name: 'Camera', icon: '📷' }, { name: 'Maps', icon: '🗺️' },
        { name: 'Weather', icon: '☀️' }, { name: 'Clock', icon: '⏰' },
        { name: 'Notes', icon: '📝' }, { name: 'Reminders', icon: '🔔' }
    ];
    const sampleAppsPage1 = [
        { name: 'Health', icon: '❤️' }, { name: 'Wallet', icon: '💰' },
        { name: 'Settings', icon: '⚙️' }, { name: 'Calculator', icon: '🧮' }
    ];
    const dockApps = [
        { name: 'Phone', icon: '📞' }, { name: 'Mail', icon: '📧' },
        { name: 'Browser', icon: '🌐' }, { name: 'Music', icon: '🎵' }
    ];

    function createAppElement(app) {
        const appEl = document.createElement('div');
        appEl.classList.add('app');
        appEl.innerHTML = `<div class="icon">${app.icon}</div><span>${app.name}</span>`;
        return appEl;
    }

    sampleAppsPage0.forEach(app => page0Grid.appendChild(createAppElement(app)));
    sampleAppsPage1.forEach(app => page1Grid.appendChild(createAppElement(app)));
    dockApps.forEach(app => dock.appendChild(createAppElement(app)));

    // Initial setup: Phone starts OFF
    function initializeEmulatorView() {
        // Screen is initially off
        phoneScreen.style.backgroundColor = '#000';
        lockScreen.classList.add('hidden');
        homeScreen.classList.remove('active'); // Ensure home is hidden

        // Time will update once screen is turned on by power button
        // No need to call updateTime() here if screen is off.
    }

    // Populate apps once on DOM load, regardless of screen state
    sampleAppsPage0.forEach(app => page0Grid.appendChild(createAppElement(app)));
    sampleAppsPage1.forEach(app => page1Grid.appendChild(createAppElement(app)));
    dockApps.forEach(app => dock.appendChild(createAppElement(app)));

    initializeEmulatorView(); // Set initial visual state (screen off)

    // --- Navigation Button Event Listeners ---
    navHomeButton.addEventListener('click', () => {
        if (isScreenOn && !isLocked) {
            showPage(0); // Go to the first app page (home)
        }
    });

    // Placeholder for other nav buttons
    // navBackButton.addEventListener('click', () => { ... });
    // navRecentsButton.addEventListener('click', () => { ... });

    updateTime(); // Initial time update

    // --- Pop-up Functionality ---
    const popupOverlay = document.querySelector('.popup-overlay');
    const popupTitleElem = document.querySelector('.popup-title');
    const popupMessageElem = document.querySelector('.popup-message');
    const popupCloseButton = document.querySelector('.popup-close-button');

    function showPopup(title, message) {
        popupTitleElem.textContent = title;
        popupMessageElem.textContent = message;
        popupOverlay.classList.remove('hidden');
    }

    function hidePopup() {
        popupOverlay.classList.add('hidden');
    }

    popupCloseButton.addEventListener('click', hidePopup);
    // Clicking on the overlay itself can also close the popup (optional)
    popupOverlay.addEventListener('click', (event) => {
        if (event.target === popupOverlay) { // Ensure click is on overlay, not on popup content
            hidePopup();
        }
    });

    // Example Usage (can be removed or called from elsewhere):
    // setTimeout(() => showPopup("Test Popup", "This is a test of the popup system."), 5000); // Shows after 5 seconds

    // --- Notification Panel Toggle ---
    let welcomeNotificationShown = false; // Track if initial welcome is shown

    function openNotificationPanel() {
        if (notificationPanel) {
            notificationPanel.classList.add('open');
            if (!welcomeNotificationShown && panelNotificationsList.children.length === 0) {
                // Show welcome notification only once, or if list is empty
                displayWelcomeNotification(); // Now populates the panel
                welcomeNotificationShown = true;
            }
        }
    }

    function closeNotificationPanel() {
        if (notificationPanel) {
            notificationPanel.classList.remove('open');
        }
    }

    function toggleNotificationPanel() {
        if (notificationPanel) {
            notificationPanel.classList.toggle('open');
        }
    }

    // Temporary trigger: Click on any status bar to toggle panel
    mainStatusBarElements.forEach(bar => {
        bar.addEventListener('click', (event) => {
            // Prevent clicks on status bar content (like time or icons) from toggling if not desired
            // For now, any click on status bar will toggle.
            if (isScreenOn) { // Only allow opening if screen is on
                 toggleNotificationPanel();
            }
        });
    });

    // Close panel if home button is pressed and panel is open
    navHomeButton.addEventListener('click', () => {
        if (notificationPanel && notificationPanel.classList.contains('open')) {
            closeNotificationPanel();
        }
        // Existing home button functionality (showPage(0)) will still run
    });


    // Redundant power click listener removed, integrated above.

    // --- Quick Settings Toggle Logic ---
    const quickSettingsStates = {
        wifi: true, // Default to on
        bluetooth: true, // Default to on
        silent: false, // Default to off
        flashlight: false // Default to off
    };

    function updateQuickSettingTileUI(tile, settingName) {
        const iconElement = tile.querySelector('.material-icons');
        const isSilentToggle = settingName === 'silent';
        const isCurrentlyOn = quickSettingsStates[settingName];

        if (isSilentToggle) {
            // For Silent: state true means Silent is ON (inactive style, volume_off)
            // state false means Silent is OFF (active style, volume_up)
            if (isCurrentlyOn) { // Silent mode is ON
                tile.classList.add('inactive');
                iconElement.textContent = 'volume_off';
            } else { // Silent mode is OFF (sound is on)
                tile.classList.remove('inactive');
                iconElement.textContent = 'volume_up';
            }
        } else {
            // For Wi-Fi, Bluetooth, Flashlight: state true means feature is ON (no .off class)
            // state false means feature is OFF (.off class)
            if (isCurrentlyOn) {
                tile.classList.remove('off');
            } else {
                tile.classList.add('off');
            }
        }
    }

    quickSettingTiles.forEach(tile => {
        const settingName = tile.dataset.setting;
        updateQuickSettingTileUI(tile, settingName); // Initialize UI based on default states

        tile.addEventListener('click', () => {
            quickSettingsStates[settingName] = !quickSettingsStates[settingName];
            updateQuickSettingTileUI(tile, settingName);
            // In a real scenario, this would also trigger actual functionality
        });
    });

    if (clearAllButton && panelNotificationsList) {
        clearAllButton.addEventListener('click', () => {
            panelNotificationsList.innerHTML = ''; // Clear all notifications from the panel
            // Optionally, reset welcomeNotificationShown if you want it to reappear next time panel opens and list is empty
            // welcomeNotificationShown = false;
        });
    }
    // updateTime(); // Removed: Initial time update handled by power on

    // --- Fingerprint Sensor Logic ---
    let fingerprintTimer = null;
    let fingerprintTouchStartTime = 0;

    if (fingerprintSensor) {
        const clearFingerprintScan = () => {
            if (fingerprintTimer) {
                clearTimeout(fingerprintTimer);
                fingerprintTimer = null;
            }
            fingerprintSensor.classList.remove('active-scan');
        };

        const startFingerprintScan = (event) => {
            // Allow scan only if on lock screen and screen is on
            if (!isScreenOn || !isLocked || lockScreen.classList.contains('hidden')) {
                return;
            }
            event.preventDefault(); // Prevent default touch actions like scrolling or text selection

            fingerprintSensor.classList.add('active-scan');
            fingerprintTouchStartTime = Date.now();

            fingerprintTimer = setTimeout(() => {
                // Check actual hold time, allow slight variance like 4900ms for a 5000ms target
                if (Date.now() - fingerprintTouchStartTime >= 4900) {
                    unlockScreen();
                }
                clearFingerprintScan();
            }, 5000);
        };

        fingerprintSensor.addEventListener('mousedown', startFingerprintScan);
        fingerprintSensor.addEventListener('touchstart', startFingerprintScan, { passive: false });

        // Events to cancel the scan
        fingerprintSensor.addEventListener('mouseup', clearFingerprintScan);
        fingerprintSensor.addEventListener('touchend', clearFingerprintScan);
        fingerprintSensor.addEventListener('touchcancel', clearFingerprintScan);
        fingerprintSensor.addEventListener('mouseleave', () => {
            if (fingerprintTimer) { // Only clear if a scan was genuinely in progress
                clearFingerprintScan();
            }
        });
    }
});
