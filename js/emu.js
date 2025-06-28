document.addEventListener('DOMContentLoaded', () => {
    const phoneScreen = document.querySelector('.screen');
    const lockScreen = document.querySelector('.lock-screen');
    const homeScreen = document.querySelector('.home-screen');
    const powerButton = document.querySelector('.power-button');
    const timeElements = document.querySelectorAll('.time');
    const appPages = document.querySelectorAll('.app-grid');
    const pageDots = document.querySelectorAll('.page-indicator .dot');

    let isScreenOn = false;
    let isLocked = true;
    let currentPage = 0;

    // --- Power Button Functionality ---
    powerButton.addEventListener('click', () => {
        isScreenOn = !isScreenOn;
        if (isScreenOn) {
            phoneScreen.style.backgroundColor = isLocked ? '#333' : '#eee'; // Lock or home screen color
            if (isLocked) {
                lockScreen.classList.remove('hidden');
                homeScreen.classList.remove('active');
            } else {
                lockScreen.classList.add('hidden');
                homeScreen.classList.add('active');
                showPage(currentPage);
            }
        } else {
            phoneScreen.style.backgroundColor = '#000'; // Screen off
            lockScreen.classList.add('hidden');
            homeScreen.classList.remove('active');
        }
        updateTime(); // Update time when screen turns on
    });

    // --- Time Display ---
    function updateTime() {
        if (!isScreenOn) return;

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
        phoneScreen.style.backgroundColor = '#eee'; // Home screen background
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

    // Initial setup
    if (isScreenOn) {
        if (isLocked) {
            lockScreen.classList.remove('hidden');
        } else {
            homeScreen.classList.add('active');
            showPage(0); // Show first page
        }
    } else {
        phoneScreen.style.backgroundColor = '#000'; // Screen off
    }
    updateTime(); // Initial time update
});
