document.addEventListener('DOMContentLoaded', () => {
    const phoneScreen = document.querySelector('.screen');
    const lockScreen = document.querySelector('.lock-screen');
    const homeScreen = document.querySelector('.home-screen');
    const powerButton = document.querySelector('.power-button');
    const timeElements = document.querySelectorAll('.time');
    const notificationsContainer = lockScreen.querySelector('.notifications');
    const appPages = document.querySelectorAll('.app-grid');
    const pageDots = document.querySelectorAll('.page-indicator .dot');
    const navHomeButton = document.querySelector('.nav-home');
    // const navBackButton = document.querySelector('.nav-back'); // For future use
    // const navRecentsButton = document.querySelector('.nav-recents'); // For future use


    let isScreenOn = true; // Default: Screen is ON
    let isLocked = true;   // Default: Phone is LOCKED
    let currentPage = 0;

    // --- Power Button Functionality ---
    powerButton.addEventListener('click', () => {
        if (isScreenOn) {
            // Screen is currently ON (either lock or home), so turn it OFF
            isScreenOn = false;
            phoneScreen.style.backgroundColor = '#000'; // Set screen to black
            lockScreen.classList.add('hidden');
            homeScreen.classList.remove('active'); // Ensure home screen is also hidden
        } else {
            // Screen is currently OFF, so turn it ON to the lock screen
            isScreenOn = true;
            isLocked = true; // Always go to lock screen when turning "on" with power button

            phoneScreen.style.backgroundColor = 'transparent'; // Lock screen has its own background
            lockScreen.classList.remove('hidden');
            homeScreen.classList.remove('active'); // Ensure home screen is not shown

            displayWelcomeNotification(); // Show notifications on lock screen
            updateTime(); // Ensure time is current
        }
    });

    // --- Notification Display ---
    function displayWelcomeNotification() {
        notificationsContainer.innerHTML = ''; // Clear existing notifications

        const notificationHTML = `
            <div class="notification">
                <div class="app-name">CheckMate App</div>
                <div class="title">Welcome to CheckMate</div>
                <div class="text">Thank you for choosing CheckMate! Explore its features.</div>
            </div>
        `;
        // For now, just one notification. Could be expanded to an array.
        notificationsContainer.innerHTML = notificationHTML;
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
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const formattedTime = `${hours}:${minutes} ${ampm}`;

        timeElements.forEach(el => el.textContent = formattedTime);
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

    // Initial setup: Phone starts ON and LOCKED
    function initializeEmulatorView() {
        phoneScreen.style.backgroundColor = 'transparent'; // Lock screen (or home screen) provides its own background

        if (isLocked) {
            lockScreen.classList.remove('hidden');
            homeScreen.classList.remove('active');
            displayWelcomeNotification();
        } else {
            // This case should ideally not happen on initial load if isLocked is true by default
            lockScreen.classList.add('hidden');
            homeScreen.classList.add('active');
            showPage(currentPage); // Show current page (should be 0)
        }
        updateTime(); // Update time immediately
    }

    initializeEmulatorView(); // Call the function to set up the view

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
});
