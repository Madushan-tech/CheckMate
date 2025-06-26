// CheckMate Website JavaScript
class CheckMateApp {
  constructor() {
    this.currentPage = 'home';
    this.countdownInterval = null; // Initialize countdownInterval property
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupModal();
    this.setupDateFilter();
    this.setupSearch();
    this.loadCurrentPage(); // This will call loadHomePage if on home, which now calls initializeAndDisplayTaskCountdown
    this.setupTabs();
    this.setupStepsModalInteraction(); // New method call
    // Removed this.startTaskCountdown(); - it's now handled by loadHomePage
  }

  setupStepsModalInteraction() {
    const stepsModalOverlay = document.getElementById('steps-modal-overlay');

    // Event listener for "View Steps" links (delegated to mainContent)
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-steps-link')) {
          e.preventDefault();
          const taskId = e.target.dataset.taskId;
          this.openStepsModal(taskId);
        }
      });
    }

    // Event listener for closing the modal
    if (stepsModalOverlay) {
      stepsModalOverlay.addEventListener('click', (e) => {
        if (e.target === stepsModalOverlay || e.target.closest('.close-modal-btn')) {
          this.closeStepsModal();
        }
      });
    }

    // Event listeners for step interactions (checkbox, toggle arrow) within the modal
    const stepsListUl = document.getElementById('steps-list');
    if (stepsListUl) {
      stepsListUl.addEventListener('click', (e) => {
        const target = e.target;
        // Handle checkbox change
        if (target.type === 'checkbox' && target.dataset.stepId) {
          const stepId = target.dataset.stepId;
          const taskId = target.dataset.taskId;
          const isChecked = target.checked;
          this.updateTaskStepCompletion(taskId, stepId, isChecked);
        }
        // Handle toggle arrow click
        else if (target.classList.contains('step-toggle-arrow') && target.dataset.stepId) {
          const stepLi = target.closest('.step-item');
          const stepId = stepLi.dataset.stepId;
          const taskId = stepLi.dataset.taskId;
          this.toggleStepActions(stepId, taskId, target);
        }
        // Handle sub-action button click
        else if (target.classList.contains('btn-step-action') && target.dataset.stepId) {
            const stepId = target.dataset.stepId;
            const taskId = target.dataset.taskId; // Get from button
            const action = target.dataset.action;
            this.handleStepSubAction(action, stepId, taskId);
        }
      });
    }
  }

  updateTaskStepCompletion(taskId, stepId, isChecked) {
    // Find the task and step in your data structure and update it
    // For now, this is a placeholder. In a real app, update state and potentially re-render.
    const task = this.getUpcomingTasks().find(t => t.id === taskId);
    if (task && task.steps) {
      const step = task.steps.find(s => s.id === stepId);
      if (step) {
        step.completed = isChecked;
        console.log(`Task ${taskId}, Step ${stepId} completion changed to ${isChecked}`);

        // Recalculate progress
        const completedSteps = task.steps.filter(s => s.completed).length;
        const totalSteps = task.steps.length;
        task.progress = totalSteps > 0 ? (completedSteps / totalSteps) : 0;

        console.log(`Task ${taskId} new progress: ${task.progress}`);
        this.updateTaskCardUI(taskId); // Update the UI
      }
    }
  }

  updateTaskCardUI(taskId) {
    const task = this.getUpcomingTasks().find(t => t.id === taskId);
    if (!task || task.type !== 'multi-step') return;

    const taskCardElement = document.querySelector(`.task-card[data-task-card-id="${taskId}"]`);
    if (taskCardElement) {
      const progressBarFill = taskCardElement.querySelector('.progress-bar-fill');
      if (progressBarFill) {
        progressBarFill.style.width = (task.progress * 100) + '%';
      }
    }
  }

  toggleStepActions(stepId, taskId, arrowElement) { // Added taskId
    const stepActionsDiv = document.querySelector(`.step-actions[data-step-id="${stepId}"][data-task-id="${taskId}"]`);
    if (stepActionsDiv) {
      const isExpanded = stepActionsDiv.style.display !== 'none';
      stepActionsDiv.style.display = isExpanded ? 'none' : 'block';
      arrowElement.classList.toggle('expanded', !isExpanded);
      arrowElement.textContent = isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_up';

      // Populate actions if expanding and not already populated
      if (!isExpanded && !stepActionsDiv.hasChildNodes()) {
        this.populateStepActions(stepActionsDiv, stepId, taskId); // Pass taskId
      }
    }
  }

  populateStepActions(actionsContainer, stepId, taskId) { // Added taskId
    actionsContainer.innerHTML = `
      <button class="btn-step-action" data-action="cancel" data-step-id="${stepId}" data-task-id="${taskId}">Cancel Step</button>
      <button class="btn-step-action" data-action="forward" data-step-id="${stepId}" data-task-id="${taskId}">Forward Step</button>
      <button class="btn-step-action" data-action="update-time" data-step-id="${stepId}" data-task-id="${taskId}">Update Time</button>
    `;
    // Event listeners are now handled by delegation in setupStepsModalInteraction
  }

  handleStepSubAction(action, stepId, taskId) { // Added taskId
    console.log(`Sub-action clicked: ${action} for step ${stepId} in task ${taskId}`);
    const task = this.getUpcomingTasks().find(t => t.id === taskId);
    const step = task?.steps.find(s => s.id === stepId);

    if (!step) {
        console.error("Step not found for action:", action, stepId, taskId);
        return;
    }

    if (action === 'cancel') {
      step.completed = false; // Uncheck if cancelled
      step.cancelled = true; // Mark as cancelled
      // Visually update the step item
      const stepLiElement = document.querySelector(`.step-item[data-step-id="${stepId}"]`);
      if (stepLiElement) {
        stepLiElement.classList.add('cancelled');
        const checkbox = stepLiElement.querySelector(`input[type="checkbox"]`);
        if (checkbox) checkbox.checked = false;
        // We might also want to disable the checkbox or hide actions for cancelled step
      }
      this.updateTaskStepCompletion(taskId, stepId, false); // This will also trigger progress update
      alert(`Step "${step.title}" cancelled.`);
    } else if (action === 'forward') {
      alert(`Forward step "${step.title}" (placeholder).`);
    } else if (action === 'update-time') {
      alert(`Update time for step "${step.title}" (placeholder).`);
    }
  }

  openStepsModal(taskId) {
    const tasks = this.getUpcomingTasks(); // In a real app, this might come from a state manager
    const task = tasks.find(t => t.id === taskId);
    const stepsModalOverlay = document.getElementById('steps-modal-overlay');
    const stepsListUl = document.getElementById('steps-list');
    const modalTitle = document.getElementById('steps-modal-title');

    if (!task || !stepsModalOverlay || !stepsListUl || !modalTitle) {
      console.error('Could not open steps modal, task or modal elements not found.');
      return;
    }

    modalTitle.textContent = `${task.title} - Steps`;
    stepsListUl.innerHTML = ''; // Clear previous steps

    if (task.steps && task.steps.length > 0) {
      task.steps.forEach(step => {
        const li = document.createElement('li');
        li.className = 'step-item'; // Will add styles later
        li.dataset.stepId = step.id; // Add stepId to li for easier access
        li.dataset.taskId = taskId;   // Add taskId to li for easier access
        li.innerHTML = `
          <input type="checkbox" id="step-${step.id}" ${step.completed ? 'checked' : ''} data-step-id="${step.id}" data-task-id="${taskId}">
          <label for="step-${step.id}">${step.title}</label>
          <span class="material-icons step-toggle-arrow" data-step-id="${step.id}">keyboard_arrow_down</span>
          <div class="step-actions" style="display:none;" data-step-id="${step.id}" data-task-id="${taskId}">
            <!-- Sub-actions will be populated here -->
          </div>
        `;
        stepsListUl.appendChild(li);
      });
    } else {
      stepsListUl.innerHTML = '<li>No steps defined for this task.</li>';
    }

    stepsModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  closeStepsModal() {
    const stepsModalOverlay = document.getElementById('steps-modal-overlay');
    if (stepsModalOverlay) {
      stepsModalOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Restore background scroll
    }
  }

  initializeAndDisplayTaskCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    const taskNameElement = document.getElementById('task-name-full'); // Changed ID
    const countdownElement = document.getElementById('countdown-timer');

    // --- Placeholder Task Data ---
    // This should be replaced with actual task data retrieval logic
    let currentTaskName = "Learning Python Programming Language for Beginners"; // Made longer for testing truncation
    // Example: Get end time for today at 10:00 AM
    let taskEndTime = new Date();
    taskEndTime.setHours(10, 0, 0, 0);
    // If current time is past 10 AM, set it for next day for demo purposes
    if (new Date() > taskEndTime) {
      taskEndTime.setDate(taskEndTime.getDate() + 1);
      currentTaskName = "Project Scoping Meeting for New Client Onboarding"; // Made longer
      taskEndTime.setHours(11, 30, 0, 0); // Example end time for tomorrow's task
    }
    // --- End Placeholder Task Data ---

    if (!taskNameElement || !countdownElement) { // Simplified check
      console.error("Task display or countdown elements not found!");
      return;
    }

    // Simplified function to set the task name (CSS will handle truncation)
    const displayTaskName = (fullName) => {
      if (fullName) {
        taskNameElement.textContent = fullName;
      } else {
        taskNameElement.textContent = "No active task";
      }
    };

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = taskEndTime.getTime() - now;

      if (distance < 0) {
        countdownElement.textContent = "Ended";
        displayTaskName(currentTaskName); // Keep showing task name
        // Optionally, clear the interval if no new task is immediately available
        // clearInterval(this.countdownInterval);
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElement.textContent = `${minutes} Min ${seconds} Sec`;
      displayTaskName(currentTaskName); // Call simplified display function
    };

    updateCountdown(); // Initial call
    this.countdownInterval = setInterval(updateCountdown, 1000); // Store interval ID
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
        headerElement.style.display = 'flex';
      } else {
        headerElement.style.display = 'none';
        // If task container might exist from a previous SPA state (though it's cleared by innerHTML typically)
        const taskCountdownContainer = document.querySelector('.task-countdown-container');
        if (taskCountdownContainer) {
            taskCountdownContainer.style.top = '0px'; // Reset if header is not there
        }
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

  loadProfilePage(container) {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    container.innerHTML = `
      <h1 class="page-title">Profile</h1>
      <p>Profile content will go here.</p>
    `;
  }

  loadHomePage(mainContentContainer) { // Renamed 'container' for clarity
    // Clear existing content from mainContentContainer
    mainContentContainer.innerHTML = '';

    // Create and insert the task countdown container
    // It should be a child of '.container' (parent of header and main-content),
    // and placed between header and main-content.

    const overallAppContainer = document.querySelector('.container'); // This is the parent of header, main-content etc.
    const headerElement = document.querySelector('.header');

    // Remove existing countdown container if it was somehow left from a previous load
    let existingCountdownContainer = overallAppContainer.querySelector('.task-countdown-container');
    if (existingCountdownContainer) {
        existingCountdownContainer.remove();
    }

    const taskCountdownDiv = document.createElement('div');
    taskCountdownDiv.className = 'task-countdown-container';
    taskCountdownDiv.innerHTML = `
        <div class="task-display">
            <span id="task-name-full"></span>
        </div>
        <div id="countdown-timer" class="countdown-timer"></div>
    `;

    if (overallAppContainer && headerElement) {
      // Insert taskCountdownDiv after headerElement, within overallAppContainer
      headerElement.insertAdjacentElement('afterend', taskCountdownDiv);
    } else {
      console.error("Could not find .container or .header to insert task countdown.");
      // Fallback: Prepend to mainContentContainer if header/overallContainer not found, though this is not the target structure.
      // mainContentContainer.insertAdjacentElement('beforebegin', taskCountdownDiv); // This would put it before mainContentContainer
    }

    // Now, populate the mainContentContainer (passed as 'container' argument)
    mainContentContainer.innerHTML = `
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

    // Adjust sticky top for task countdown container
    // The taskCountdownContainer is now a sibling of mainContentContainer, not a child.
    // We need to select it from the document or the overallAppContainer.
    const newlyInsertedTaskCountdownContainer = overallAppContainer.querySelector('.task-countdown-container');
    if (headerElement && newlyInsertedTaskCountdownContainer && headerElement.style.display !== 'none') {
      const headerHeight = headerElement.offsetHeight;
      // The margin-top is part of the .task-countdown-container's own style in CSS.
      // The 'top' for sticky positioning should be exactly the header's height.
      newlyInsertedTaskCountdownContainer.style.top = headerHeight + 'px';

    } else if (newlyInsertedTaskCountdownContainer) {
      newlyInsertedTaskCountdownContainer.style.top = '0px'; // Fallback if header isn't visible
    }

    this.initializeAndDisplayTaskCountdown(); // Initialize countdown for home page
  }

  loadPlanPage(mainContentContainer) { // Renamed 'container' for clarity
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
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
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
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
      <div class="task-card fade-in" data-task-card-id="${task.id}"> <!-- Added data-task-card-id -->
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
        ${task.type === 'multi-step' ? `
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${task.progress * 100}%;"></div>
          </div>
          <a href="#" class="view-steps-link" data-task-id="${task.id}">View Steps</a>
        ` : ''}
      </div>
    `).join('');
  }

  getUpcomingTasks() { // Renamed function
    return [
      {
        id: 'task1', // Added ID
        title: 'Smith Script Write',
        time: '4:00 P.M. - 6:00 P.M.',
        project: 'Project 003',
        icon: 'engineering',
        iconColor: 'text-yellow',
        starred: true
      },
      {
        id: 'task2', // Added ID
        title: 'Script App Development',
        time: '7:00 P.M. - 8:00 P.M.',
        project: 'Project 001',
        icon: 'code',
        iconColor: 'text-gray',
        starred: true,
        type: 'multi-step', // Added type
        progress: 0.5, // Example progress (50%)
        steps: [ // Added steps
          { id: 'step2.1', title: 'Define core features', completed: true },
          { id: 'step2.2', title: 'Design database schema', completed: true },
          { id: 'step2.3', title: 'Develop API endpoints', completed: false },
          { id: 'step2.4', title: 'Frontend implementation', completed: false }
        ]
      },
      {
        id: 'task3', // Added ID
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

