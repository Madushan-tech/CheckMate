// CheckMate Website JavaScript
class CheckMateApp {
  constructor() {
    this.currentPage = 'home';
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupModal();
    this.setupDateFilter();
    this.setupSearch();
    this.loadCurrentPage();
    this.setupTabs(); // Call a new method to set up tab listeners
    this.startTaskCountdown(); // Renamed: Start the task countdown
  }

  startTaskCountdown() {
    const taskNameElement1 = document.getElementById('task-line-1');
    const taskNameElement2 = document.getElementById('task-line-2');
    const countdownElement = document.getElementById('countdown-timer');

    // --- Placeholder Task Data ---
    // This should be replaced with actual task data retrieval logic
    let currentTaskName = "Learning Python Programming";
    // Example: Get end time for today at 10:00 AM
    let taskEndTime = new Date();
    taskEndTime.setHours(10, 0, 0, 0);
    // If current time is past 10 AM, set it for next day for demo purposes
    if (new Date() > taskEndTime) {
      taskEndTime.setDate(taskEndTime.getDate() + 1);
      currentTaskName = "Project Scoping Meeting"; // Example of a different task for tomorrow
      taskEndTime.setHours(11, 30, 0, 0); // Example end time for tomorrow's task
    }
    // --- End Placeholder Task Data ---

    if (!taskNameElement1 || !taskNameElement2 || !countdownElement) {
      console.error("Header countdown elements not found!");
      return;
    }

    // Function to wrap the third word
    const displayTaskName = (fullName) => {
      const words = fullName.split(' ');
      if (words.length >= 3) {
        taskNameElement1.textContent = words.slice(0, 2).join(' ');
        taskNameElement2.textContent = words.slice(2).join(' '); // Remaining words on line 2
      } else if (words.length > 0) {
        taskNameElement1.textContent = fullName;
        taskNameElement2.textContent = ""; // No second line
      } else {
        taskNameElement1.textContent = "No active task";
        taskNameElement2.textContent = "";
      }
    };

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = taskEndTime.getTime() - now;

      if (distance < 0) {
        countdownElement.textContent = "Ended";
        displayTaskName(currentTaskName); // Keep showing task name
        // Optionally, clear the interval if no new task is immediately available
        // clearInterval(countdownInterval);
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElement.textContent = `${minutes} Min ${seconds} Sec`;
      displayTaskName(currentTaskName);
    };

    updateCountdown(); // Initial call
    const countdownInterval = setInterval(updateCountdown, 1000); // Update every second
  }

  setupTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        // Prevent default if it's an anchor, though we are using buttons
        // event.preventDefault();
        const tabName = event.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
        this.openTab(event, tabName);
      });
    });
  }

  openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    // Removed call to this.loadTabContent(tabName);
  }

  // Removed loadTabContent and specific task-generating functions
  // (getAllItemsTasks, getNextDayItemsTasks, getIncompleteItemsTasks, getCancelledItemsTasks)

  setupNavigation() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.nav-item')) {
        e.preventDefault();
        const navItem = e.target.closest('.nav-item');
        const page = navItem.dataset.page;
        if (page) {
          this.navigateToPage(page);
        }
      }
    });
  }

  setupModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      // Close modal when clicking overlay
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });

      // Handle form submission
      const form = modal.querySelector('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleTaskSubmission(form);
        });
      }
    }
  }

  setupDateFilter() {
    const dateButtons = document.querySelectorAll('.date-btn');
    dateButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        dateButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Update content based on selected date
        this.updateTasksForDate(btn.textContent);
      });
    });
  }

  setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
  }

  navigateToPage(page) {
    // Update active navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    const activeNavItem = document.querySelector(`[data-page="${page}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }

    // Conditional Header Display
    const headerElement = document.querySelector('.header');
    if (headerElement) {
      if (page === 'home') {
        headerElement.style.display = 'flex'; // Or remove a 'hidden' class
      } else {
        headerElement.style.display = 'none'; // Or add a 'hidden' class
      }
    }

    // Update page content
    this.currentPage = page;
    this.loadPageContent(page);
  }

  loadPageContent(page) {
    const mainContent = document.querySelector('.main-content');
    
    switch(page) {
      case 'home':
        this.loadHomePage(mainContent);
        break;
      case 'plan':
        this.loadPlanPage(mainContent);
        break;
      case 'report':
        this.loadReportPage(mainContent);
        break;
      case 'profile':
        this.loadProfilePage(mainContent); // Added case for profile
        break;
    }
  }

  loadProfilePage(container) { // Added function for profile page
    container.innerHTML = `
      <h1 class="page-title">Profile</h1>
      <p>Profile content will go here.</p>
    `;
  }

  loadHomePage(container) {
    // Container for task display and countdown, replacing the old timestamp
    const taskCountdownHTML = `
      <div class="task-countdown-container">
        <div class="task-display">
            <span id="task-line-1"></span>
            <span id="task-line-2"></span>
        </div>
        <div id="countdown-timer" class="countdown-timer"></div>
      </div>
    `;

    container.innerHTML = `
      ${taskCountdownHTML}

      <section class="stats-section">
        <div class="section-header">
          <h2 class="section-title">Today Journey</h2>
        </div>
        <div class="card stats-card fade-in">
          <div class="stats-icon-section">
            <span class="material-icons stats-icon">list_alt</span>
            <div class="stats-label">Plan</div>
            <div class="stats-number">12</div>
          </div>
          <div class="stats-details">
            <div class="stats-row">
              <div class="stats-item text-green">
                <span class="material-icons">check_circle</span>
                <span>Complete</span>
              </div>
              <span class="stats-badge badge-green">07</span>
            </div>
            <div class="stats-row">
              <div class="stats-item text-yellow">
                <span class="material-icons">skip_next</span>
                <span>Next Day</span>
              </div>
              <span class="stats-badge badge-yellow">02</span>
            </div>
            <div class="stats-row">
              <div class="stats-item text-red">
                <span class="material-icons">cancel</span>
                <span>Incomplete</span>
              </div>
              <span class="stats-badge badge-red">02</span>
            </div>
            <div class="stats-row">
              <div class="stats-item text-gray">
                <span class="material-icons">delete</span>
                <span>Cancel</span>
              </div>
              <span class="stats-badge badge-gray">01</span>
            </div>
          </div>
        </div>
      </section>

      <section class="tasks-section">
        <div class="section-header">
          <h2 class="section-title">Upcoming Tasks</h2>
        </div>
        <div class="tasks-list">
          ${this.generateTaskCards(this.getUpcomingTasks())}
        </div>
      </section>
    `;
    // Note: The tab content area defined in index.html will remain, but will be empty
    // as tab content population is reverted.
  }

  loadPlanPage(container) {
    container.innerHTML = `
      <div class="date-filter">
        <button class="date-btn">Tomorrow</button>
        <button class="date-btn active">Today</button>
        <button class="date-btn">Yesterday</button>
        <button class="date-btn">2/1/25</button>
        <button class="date-btn">1/31/25</button>
      </div>

      <section>
        <div class="section-header">
          <h2 class="section-title">Ongoing Tasks</h2>
          <a href="#" class="see-more">See more</a>
        </div>
        <div class="task-card">
          <div class="task-header">
            <h3 class="task-title">Smith Script Write</h3>
          </div>
          <div class="task-meta">
            <span>4:00 P.M. - 6:00 P.M.</span>
          </div>
        </div>
      </section>

      <section>
        <div class="section-header">
          <h2 class="section-title">Forward to Tomorrow</h2>
          <a href="#" class="see-more">See more</a>
        </div>
        <div class="task-card">
          <div class="task-header">
            <h3 class="task-title">Smith Script Write</h3>
          </div>
          <div class="task-meta">
            <span>4:00 P.M. - 6:00 P.M.</span>
          </div>
        </div>
      </section>

      <section>
        <div class="section-header">
          <h2 class="section-title">Complete</h2>
          <a href="#" class="see-more">See more</a>
        </div>
        <div class="task-card">
          <div class="task-header">
            <h3 class="task-title">Script App Development</h3>
          </div>
          <div class="task-meta">
            <span>7:00 P.M. - 8:00 P.M.</span>
          </div>
        </div>
      </section>

      <section>
        <div class="section-header">
          <h2 class="section-title">Incomplete</h2>
          <a href="#" class="see-more">See more</a>
        </div>
        <div class="task-card">
          <div class="task-header">
            <h3 class="task-title">Script App Development</h3>
          </div>
          <div class="task-meta">
            <span>7:00 P.M. - 8:00 P.M.</span>
          </div>
        </div>
      </section>

      <section>
        <div class="section-header">
          <h2 class="section-title">Cancel</h2>
          <a href="#" class="see-more">See more</a>
        </div>
        <div class="task-card">
          <div class="task-header">
            <h3 class="task-title">Script App Development</h3>
          </div>
          <div class="task-meta">
            <span>7:00 P.M. - 8:00 P.M.</span>
          </div>
        </div>
      </section>
    `;
    
    // Re-setup date filter for this page
    this.setupDateFilter();
  }

  loadReportPage(container) {
    container.innerHTML = `
      <div class="timestamp">
        ${this.getCurrentDateTime()}
        <hr style="border-color: var(--border-color); margin-top: 0.25rem;">
      </div>
      
      <section class="stats-section">
        <div class="section-header">
          <h2 class="section-title">Today Journey</h2>
        </div>
        <div class="card stats-card fade-in">
          <div class="stats-icon-section">
            <span class="material-icons stats-icon">article</span>
            <div class="stats-label">Plan</div>
            <div class="stats-number">12</div>
          </div>
          <div class="stats-details">
            <div class="stats-row">
              <div class="stats-item text-green">
                <span class="material-icons">check_circle</span>
                <span>Complete</span>
              </div>
              <span class="stats-badge badge-green">07</span>
            </div>
            <div class="stats-row">
              <div class="stats-item text-orange">
                <span class="material-icons">fast_forward</span>
                <span>Next Day</span>
              </div>
              <span class="stats-badge badge-orange">02</span>
            </div>
            <div class="stats-row">
              <div class="stats-item text-red">
                <span class="material-icons">cancel</span>
                <span>Incomplete</span>
              </div>
              <span class="stats-badge badge-red">02</span>
            </div>
            <div class="stats-row">
              <div class="stats-item text-red">
                <span class="material-icons">delete</span>
                <span>Cancel</span>
              </div>
              <span class="stats-badge badge-red">01</span>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  generateTaskCards(tasks) {
    return tasks.map(task => `
      <div class="task-card fade-in">
        <div class="task-header">
          <h3 class="task-title">${task.title}</h3>
          <div class="task-icons">
            <span class="material-icons ${task.iconColor}">${task.icon}</span>
            <span class="material-icons ${task.starred ? 'text-yellow' : 'text-gray'}">${task.starred ? 'star' : 'star_border'}</span>
          </div>
        </div>
        <div class="task-meta">
          <span>${task.time}</span>
          <span>${task.project}</span>
        </div>
      </div>
    `).join('');
  }

  getUpcomingTasks() { // Renamed function
    return [
      {
        title: 'Smith Script Write',
        time: '4:00 P.M. - 6:00 P.M.',
        project: 'Project 003',
        icon: 'engineering',
        iconColor: 'text-yellow',
        starred: true
      },
      {
        title: 'Script App Development',
        time: '7:00 P.M. - 8:00 P.M.',
        project: 'Project 001',
        icon: 'code',
        iconColor: 'text-gray',
        starred: true
        // Reverted: Removed type, subSteps, progress
      },
      {
        title: 'Video Editing',
        time: '9:00 P.M. - 10:00 P.M.',
        project: 'Project 006',
        icon: 'play_circle_filled',
        iconColor: 'text-green',
        starred: false
      }
    ];
  }

  openNewTaskModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  handleTaskSubmission(form) {
    const formData = new FormData(form);
    const taskData = {
      name: formData.get('taskName'),
      description: formData.get('description'),
      datetime: formData.get('datetime'),
      alarm: formData.get('alarm') === 'on',
      multiStep: formData.get('multiStep') === 'on'
    };

    // Simulate task creation
    console.log('Creating task:', taskData);
    
    // Show success message
    this.showNotification('Task created successfully!');
    
    // Close modal
    this.closeModal();
    
    // Reset form
    form.reset();
  }

  handleSearch(query) {
    console.log('Searching for:', query);
    // Implement search functionality
  }

  updateTasksForDate(date) {
    console.log('Loading tasks for date:', date);
    // Implement date-based task filtering
  }

  getCurrentDateTime() {
    const now = new Date();
    const options = {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return now.toLocaleDateString('en-US', options);
  }

  showNotification(message) {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--accent-green);
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      z-index: 3000;
      animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  loadCurrentPage() {
    // Load the initial page based on URL or default to home
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'home';
    this.navigateToPage(page);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CheckMateApp();
});

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', () => {
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('button, .nav-item, .task-card');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Add CSS for ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});

