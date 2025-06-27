// CheckMate Website JavaScript
class CheckMateApp {
  constructor() {
    this.currentPage = 'home';
    this.countdownInterval = null; // Initialize countdownInterval property
    this.isReinitializing = false; // Flag for countdown re-initialization
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupModal();
    this.setupDateFilter();
    this.setupSearch();
    this.loadCurrentPage();
    this.setupTabs();
    this.setupStepsModalInteraction(); // New method call
    this.initializeAndDisplayTaskCountdown(); // Call global countdown timer
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
          const isChecked = target.checked; // State of the checkbox AFTER the click
          console.log(`Checkbox clicked: taskId=${taskId}, stepId=${stepId}, checkbox.checked=${isChecked}`);
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
        console.log(`updateTaskStepCompletion: Found step: ${step.title}, current step.completed: ${step.completed}, received isChecked: ${isChecked}`);
        step.completed = isChecked; // Update data model
        console.log(`updateTaskStepCompletion: Step ${stepId} (${step.title}) NEW step.completed: ${step.completed}`);

        // Update the UI for the specific step item in the modal
        const stepLiElement = document.querySelector(`.step-item[data-step-id="${stepId}"][data-task-id="${taskId}"]`);
        if (stepLiElement) {
          const labelElement = stepLiElement.querySelector(`label[for="step-${stepId}"]`);
          if (labelElement) {
            console.log(`Label for ${stepId} current classes: ${labelElement.className}`);
            if (isChecked) {
              labelElement.classList.add('task-completed');
              console.log(`Label for ${stepId} AFTER ADDING task-completed: ${labelElement.className}`);
            } else {
              labelElement.classList.remove('task-completed');
              console.log(`Label for ${stepId} AFTER REMOVING task-completed: ${labelElement.className}`);
            }
          } else {
            console.error(`Label element not found for stepId: ${stepId} in taskId: ${taskId}`);
          }
          // Ensure checkbox visual state matches the data model state
          const checkboxElement = stepLiElement.querySelector(`input[type="checkbox"]`);
          if (checkboxElement) {
            checkboxElement.checked = step.completed; // Use the model's state
            console.log(`Checkbox for ${stepId} visual 'checked' property set to: ${checkboxElement.checked}`);
          } else {
            console.error(`Checkbox element not found for stepId: ${stepId} in taskId: ${taskId}`);
          }
        } else {
          console.error(`stepLiElement not found for stepId: ${stepId} in taskId: ${taskId}`);
        }

        // Recalculate progress for the parent task
        const completedSteps = task.steps.filter(s => s.completed).length;
        const totalSteps = task.steps.length;
        task.progress = totalSteps > 0 ? (completedSteps / totalSteps) : 0;

        console.log(`Task ${taskId} new progress: ${task.progress}`);
        this.updateTaskCardUI(taskId); // Update the task card UI (progress bar)
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
        const newWidth = task.progress * 100;
        console.log(`Updating task ${taskId} progress bar. Raw progress: ${task.progress}, Width: ${newWidth}%`);
        progressBarFill.style.width = newWidth + '%';
      }
      // Also update completed steps count on the card
      const completedStepsCountElement = taskCardElement.querySelector('.completed-steps-count');
      if (completedStepsCountElement && task.steps) {
        completedStepsCountElement.textContent = `${task.steps.filter(s => s.completed).length}/${task.steps.length}`;
      }
      // Also update step info on the card
      const taskStepInfoElement = taskCardElement.querySelector('.task-step-info');
      if (taskStepInfoElement && task.steps && task.steps.length > 0) { // ensure steps exist
          taskStepInfoElement.textContent = this.getStepInfo(task.steps);
      } else if (taskStepInfoElement) {
          taskStepInfoElement.textContent = ''; // Clear if no steps
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
    let task;
    if (this.currentPage === 'plan') {
      const planTasks = this.getPlanPageTasks(); // Assuming this method exists and returns the plan tasks
      task = planTasks.find(t => t.id === taskId);
    }

    if (!task) { // If not found in plan tasks or not on plan page, try upcoming tasks
      const upcomingTasks = this.getUpcomingTasks();
      task = upcomingTasks.find(t => t.id === taskId);
    }

    const stepsModalOverlay = document.getElementById('steps-modal-overlay');
    const stepsModalContent = stepsModalOverlay.querySelector('.modal-content');
    const stepsListUl = document.getElementById('steps-list');
    const modalTitle = document.getElementById('steps-modal-title');

    if (!task || !stepsModalOverlay || !stepsListUl || !modalTitle || !stepsModalContent) {
      console.error('Could not open steps modal, task or modal elements not found.');
      return;
    }

    // Add dark theme class
    stepsModalContent.classList.add('dark-theme');

    modalTitle.textContent = `${task.title} - Steps`;
    stepsListUl.innerHTML = ''; // Clear previous steps

    if (task.steps && task.steps.length > 0) {
      task.steps.forEach(step => {
        const li = document.createElement('li');
        li.className = 'step-item'; // Will add styles later
        li.dataset.stepId = step.id; // Add stepId to li for easier access
        li.dataset.taskId = taskId;   // Add taskId to li for easier access
        const labelClass = step.completed ? 'class="task-completed"' : '';
        li.innerHTML = `
          <input type="checkbox" id="step-${step.id}" ${step.completed ? 'checked' : ''} data-step-id="${step.id}" data-task-id="${taskId}">
          <label for="step-${step.id}" ${labelClass}>${step.title}</label>
          <div class="step-actions" style="display:none;" data-step-id="${step.id}" data-task-id="${taskId}">
            <!-- Sub-actions will be populated here -->
            <!-- Note: Actions are currently not shown as toggle arrow is removed.
                 If actions are still needed, a new UI element to trigger them would be required.
                 For now, assuming removal of arrow also means actions are not accessible via this UI. -->
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

    const taskNameElement = document.getElementById('task-name-full');
    const countdownElement = document.getElementById('countdown-timer');

    if (!taskNameElement || !countdownElement) {
      console.error("Task display or countdown elements not found!");
      return;
    }

    let activeTaskName = "No active task";
    let activeTaskEndTime = null;
    const today = new Date(); // Use a consistent "today" for all parsing in one cycle

    if (this.currentPage === 'plan') {
      const planTasks = this.getPlanPageTasksSorted(); // Already sorted by time
      const now = new Date(); // Current time for comparison

      let foundTask = null;
      for (const task of planTasks) {
        const { startDate, endDate } = this.parseTaskDateTime(task.time, today);
        if (now >= startDate && now < endDate) {
          foundTask = task;
          activeTaskEndTime = endDate;
          break;
        }
      }

      if (foundTask) {
        activeTaskName = foundTask.title;
      } else {
        activeTaskName = "No current task from plan";
        // Optional: Find next task and show "Next: ..." or similar
      }
    } else {
      // --- Default Placeholder Task Logic (for non-plan pages) ---
      // Restore original placeholder logic more closely
      let placeholderTaskName = "Learning Python Programming Language"; // Default
      let placeholderEndTime = new Date(today);
      placeholderEndTime.setHours(10, 0, 0, 0); // Default: Today 10:00 AM

      if (new Date() > placeholderEndTime) { // If current time is past 10 AM today
        placeholderTaskName = "Project Scoping Meeting"; // Default "next" task
        placeholderEndTime.setDate(placeholderEndTime.getDate() + 1); // Tomorrow
        placeholderEndTime.setHours(11, 30, 0, 0); // Tomorrow 11:30 AM
      }
      activeTaskName = placeholderTaskName;
      activeTaskEndTime = placeholderEndTime;
    }

    taskNameElement.textContent = activeTaskName; // Display initial task name

    const updateCountdown = () => {
      const now = new Date().getTime();

      if (!activeTaskEndTime) {
        countdownElement.textContent = "No schedule";
        taskNameElement.textContent = activeTaskName; // Ensure it's updated if it changed
        return;
      }

      const distance = activeTaskEndTime.getTime() - now;

      if (distance < 0) {
        countdownElement.textContent = "Ended";
        taskNameElement.textContent = activeTaskName;

        // If a task just ended on the plan page, try to find the next one after a short delay
        if (this.currentPage === 'plan' && !this.isReinitializing) {
            this.isReinitializing = true;
            if (this.countdownInterval) { // Clear current interval before reinitializing
              clearInterval(this.countdownInterval);
              this.countdownInterval = null;
            }
            setTimeout(() => {
                this.initializeAndDisplayTaskCountdown(); // This will find the next task or show "No current task"
                this.isReinitializing = false;
            }, 1500); // Wait 1.5s then refresh
        }
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (hours > 0) {
        countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
      } else {
        countdownElement.textContent = `${minutes}m ${seconds}s`;
      }
      taskNameElement.textContent = activeTaskName; // Update task name (could change if re-initialized)
    };

    if (this.countdownInterval) { // Clear existing interval before setting a new one
        clearInterval(this.countdownInterval);
    }
    updateCountdown(); // Initial call to display immediately
    this.countdownInterval = setInterval(updateCountdown, 1000);
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

    // Conditional Header Display & Sticky Elements Positioning
    const headerElement = document.querySelector('.header');
    const taskCountdownContainer = document.querySelector('.task-countdown-container');
    // const tabsContainer = document.querySelector('.tabs'); // Tabs no longer need dynamic sticky positioning here
    const dateFilterContainer = document.querySelector('.plan-page-content .date-filter'); // More specific selector

    if (headerElement && taskCountdownContainer) {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const gapInPixels = 0.5 * rootFontSize; // 0.5rem gap

      let countdownTopPosition = 0;

      if (page === 'home') {
        headerElement.style.display = 'flex';
        requestAnimationFrame(() => {
            const headerHeight = headerElement.offsetHeight;
            countdownTopPosition = headerHeight + gapInPixels;
            taskCountdownContainer.style.top = countdownTopPosition + 'px';
            // No specific sticky positioning for date filter on home page
        });
      } else { // For 'plan', 'report', 'profile' pages
        headerElement.style.display = 'none';
        countdownTopPosition = gapInPixels;
        taskCountdownContainer.style.top = countdownTopPosition + 'px';

        if (page === 'plan' && dateFilterContainer) { // Only apply to dateFilter on plan page
            requestAnimationFrame(() => {
                const countdownHeight = taskCountdownContainer.offsetHeight;
                dateFilterContainer.style.top = (countdownTopPosition + countdownHeight) + 'px';
            });
        }
      }
    } else if (taskCountdownContainer) { // Fallback if headerElement is not found
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const gapInPixels = 0.5 * rootFontSize;
        let countdownTopPosition = gapInPixels;
        taskCountdownContainer.style.top = countdownTopPosition + 'px';

        if (page === 'plan' && dateFilterContainer) { // Only apply to dateFilter on plan page
            requestAnimationFrame(() => {
                const countdownHeight = taskCountdownContainer.offsetHeight;
                dateFilterContainer.style.top = (countdownTopPosition + countdownHeight) + 'px';
            });
        }
    }

    // Update page content
    this.currentPage = page;
    this.loadPageContent(page);
    this.initializeAndDisplayTaskCountdown(); // Refresh countdown with new page context
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
    // Removed clearInterval for global countdown
    container.innerHTML = `
      <h1 class="page-title">Profile</h1>
      <p>Profile content will go here.</p>
    `;
  }

  loadHomePage(mainContentContainer) { // Renamed 'container' for clarity
    // Clear existing content from mainContentContainer
    mainContentContainer.innerHTML = '';

    // Task countdown container is now static in index.html, so no need to create/insert it.
    // We still need to adjust its 'top' style based on header visibility.

    const overallAppContainer = document.querySelector('.container');
    const headerElement = document.querySelector('.header');
    const taskCountdownContainer = overallAppContainer.querySelector('.task-countdown-container'); // Select the static container

    // Now, populate the mainContentContainer
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

    // Adjust sticky top for task countdown container is now handled by navigateToPage.
    // Countdown is now initialized globally, but we might want to update task details if specific to home page
    // For now, let's assume initializeAndDisplayTaskCountdown handles its state correctly.
    // If initializeAndDisplayTaskCountdown needs to be aware of the current page, that's a deeper refactor.
    // this.initializeAndDisplayTaskCountdown(); // Re-evaluate if this is needed here or if global one is enough
  }

  loadPlanPage(mainContentContainer) { // Renamed 'container' for clarity
    // Removed clearInterval for global countdown

    const today = new Date();
    const todayPlus2 = new Date(today);
    todayPlus2.setDate(today.getDate() + 2);
    const todayPlus3 = new Date(today);
    todayPlus3.setDate(today.getDate() + 3);

    const formatDate = (date) => {
      return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
    };

    const todayStr = formatDate(today);
    // const todayPlus2Str = formatDate(todayPlus2); // Not used in the new order
    // const todayPlus3Str = formatDate(todayPlus3); // Not used in the new order

    // Specific dates from the request
    const date6_29_25_Str = "6/29/25";
    const date6_30_25_Str = "6/30/25";

    mainContentContainer.innerHTML = `
      <div class="plan-page-content">
        <div class="date-filter">
          <button class="date-btn">Tomorrow</button>
          <button class="date-btn active">Today</button>
          <button class="date-btn">Yesterday</button>
          <button class="date-btn">${date6_29_25_Str}</button>
          <button class="date-btn">${date6_30_25_Str}</button>
          <button class="date-btn">Note</button>
      </div>
      <div class="tasks-list">
        ${this.generateTaskCards(this.getPlanPageTasksSorted())}
      </div>
    </div>
    `;

    // Re-setup date filter for this page
    this.setupDateFilter();
    // No need for setupStickyDateFilter() if CSS handles it with top:0 and correct z-index.
  }

  // Removed setupStickyDateFilter() as CSS with top:0px and correct z-index should handle stickiness.

  getPlanPageTasksSorted() {
    const tasks = this.getPlanPageTasks();
    // Basic time string sort (AM/PM aware, hour, then minute)
    // This is a simplified sort; robust parsing would be better for complex cases.
    // Assumes "H:MM A.M./P.M." format for start time.
    tasks.sort((a, b) => {
      const timeA = this.parseTime(a.time);
      const timeB = this.parseTime(b.time);
      return timeA.hour - timeB.hour || timeA.minute - timeB.minute;
    });
    return tasks;
  }

  parseTime(timeStr) {
    // Extracts start time, e.g., "6:00 A.M." from "6:00 A.M. - 6:30 A.M."
    const startTimeStr = timeStr.split(' - ')[0];
    const [timePart, ampm] = startTimeStr.split(' ');
    let [hour, minute] = timePart.split(':').map(Number);

    if (ampm === 'P.M.' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'A.M.' && hour === 12) { // Midnight case
      hour = 0;
    }
    return { hour, minute };
  }

  parseTaskDateTime(taskTimeString, referenceDate) {
    const [startTimeStr, endTimeStr] = taskTimeString.split(' - ');

    const parseSingleTime = (timeStr, refDate) => {
      const date = new Date(refDate); // Clone reference date to avoid modifying it
      const [timePart, ampm] = timeStr.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (ampm.toUpperCase() === 'P.M.' && hours !== 12) {
        hours += 12;
      } else if (ampm.toUpperCase() === 'A.M.' && hours === 12) { // Midnight case (12 AM is 00 hours)
        hours = 0;
      }
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const startDate = parseSingleTime(startTimeStr, referenceDate);
    const endDate = parseSingleTime(endTimeStr, referenceDate);

    return { startDate, endDate };
  }

  loadReportPage(container) {
    // Removed clearInterval for global countdown
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
            ${task.secondaryIcon ? `<span class="material-icons ${task.secondaryIcon.color}">${task.secondaryIcon.name}</span>` : ''}
          </div>
        </div>
        <div class="task-meta">
          <span>${task.time}</span>
          ${task.type === 'multi-step' && task.steps && task.steps.length > 0 ? `
            <span class="task-step-info">${this.getStepInfo(task.steps)}</span>
          ` : ''}
          <span>${task.project}</span>
        </div>
        ${task.type === 'multi-step' ? `
          <div class="task-progress-section">
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${task.progress * 100}%;"></div>
            </div>
            ${task.steps && task.steps.length > 0 ? `
              <span class="completed-steps-count">${task.steps.filter(s => s.completed).length}/${task.steps.length}</span>
            ` : ''}
          </div>
          <a href="#" class="view-steps-link" data-task-id="${task.id}">View Steps</a>
        ` : ''}
      </div>
    `).join('');
  }

  getStepInfo(steps) {
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;

    if (totalSteps === 0) {
      return '';
    }

    if (completedSteps === totalSteps) {
      return 'All steps completed';
    }

    const currentStep = completedSteps + 1;
    if (totalSteps === 1) {
      return `Step ${currentStep}`;
    } else {
      // Find the next uncompleted step
      let firstUncompletedStepIndex = -1;
      for(let i=0; i<steps.length; i++) {
        if(!steps[i].completed) {
          firstUncompletedStepIndex = i;
          break;
        }
      }

      if (firstUncompletedStepIndex !== -1) {
        // Check for consecutive uncompleted steps
        let lastConsecutiveUncompletedStepIndex = firstUncompletedStepIndex;
        for (let i = firstUncompletedStepIndex + 1; i < totalSteps; i++) {
          if (!steps[i].completed) {
            lastConsecutiveUncompletedStepIndex = i;
          } else {
            break;
          }
        }
        if (firstUncompletedStepIndex === lastConsecutiveUncompletedStepIndex) {
           return `Step ${firstUncompletedStepIndex + 1}`;
        } else {
           return `Step ${firstUncompletedStepIndex + 1}-${lastConsecutiveUncompletedStepIndex + 1}`;
        }
      }
      // This case should ideally not be reached if not all steps are completed,
      // but as a fallback:
      return `Step ${currentStep}`;
    }
  }

  getUpcomingTasks() { // Renamed function
    return [
      {
        id: 'task1', // Added ID
        title: 'Smith Script Write',
        time: '4:00 P.M. - 6:00 P.M.',
        project: 'Project 003',
        icon: 'skip_next',
        iconColor: 'text-green',
        secondaryIcon: { name: 'videocam', color: 'text-green' } // Changed color to text-green
      },
      {
        id: 'task2', // Added ID
        title: 'Script App Development',
        time: '7:00 P.M. - 8:00 P.M.',
        project: 'Project 001',
        icon: 'code',
        iconColor: 'text-green', // Changed from text-gray
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
        iconColor: 'text-green'
      }
    ];
  }

  getPlanPageTasks() {
    const tasks = [
      // Daily Routine
      {
        id: 'planTask1', title: 'Wake Up & Morning Routine', time: '6:00 A.M. - 6:30 A.M.', project: 'Personal', icon: 'alarm', iconColor: 'text-blue-500', type: 'single-step'
      },
      {
        id: 'planTask2', title: 'Breakfast', time: '7:00 A.M. - 7:30 A.M.', project: 'Personal', icon: 'free_breakfast', iconColor: 'text-orange-500', type: 'single-step'
      },
      // Learning & Office
      {
        id: 'planTask3', title: 'Learning: Advanced JavaScript', time: '8:00 A.M. - 9:30 A.M.', project: 'Learning', icon: 'school', iconColor: 'text-purple-500', type: 'multi-step', progress: 0.25, steps: [
          { id: 'ppt3s1', title: 'Module 1: Asynchronous JS', completed: true }, { id: 'ppt3s2', title: 'Module 2: ES6+ Features', completed: false }, { id: 'ppt3s3', title: 'Module 3: Design Patterns', completed: false }, { id: 'ppt3s4', title: 'Module 4: Performance Optimization', completed: false }
        ]
      }, // Title was already changed in previous step, re-adding category for consistency before stripping
      {
        id: 'planTask4', title: 'Office: Team Sync Meeting', time: '10:00 A.M. - 10:45 A.M.', project: 'Work', icon: 'work', iconColor: 'text-teal-500', type: 'single-step'
      },
      // Development
      {
        id: 'planTask5', title: 'Development: Feature Implementation (Task Manager App)', time: '11:00 A.M. - 1:00 P.M.', project: 'Work', icon: 'code', iconColor: 'text-green-500', type: 'multi-step', progress: 0.6, steps: [
          { id: 'ppt5s1', title: 'Backend API for tasks', completed: true }, { id: 'ppt5s2', title: 'Frontend UI components', completed: true }, { id: 'ppt5s3', title: 'Integration and testing', completed: true }, { id: 'ppt5s4', title: 'Documentation', completed: false }, { id: 'ppt5s5', title: 'Deployment prep', completed: false }
        ]
      },
      // Daily Tasks & Other
      {
        id: 'planTask6', title: 'Lunch Break', time: '1:00 P.M. - 1:45 P.M.', project: 'Personal', icon: 'restaurant', iconColor: 'text-orange-500', type: 'single-step'
      },
      {
        id: 'planTask7', title: 'Daily Task: Grocery Shopping', time: '2:00 P.M. - 3:00 P.M.', project: 'Home', icon: 'shopping_cart', iconColor: 'text-red-400', type: 'single-step'
      },
      // Filmming
      {
        id: 'planTask8', title: 'Filmming: Shoot Scene for Short Film', time: '3:30 P.M. - 5:30 P.M.', project: 'Creative', icon: 'videocam', iconColor: 'text-indigo-500', type: 'multi-step', progress: 0.33, steps: [
          { id: 'ppt8s1', title: 'Setup lighting & camera', completed: true }, { id: 'ppt8s2', title: 'Record Scene A takes', completed: false }, { id: 'ppt8s3', title: 'Record Scene B takes', completed: false }
        ]
      },
      // Daily Tasks
      {
        id: 'planTask9', title: 'Daily Task: Clean Kitchen', time: '6:00 P.M. - 6:30 P.M.', project: 'Home', icon: 'cleaning_services', iconColor: 'text-lime-500', type: 'single-step'
      },
      // YouTube & Entertainment
      {
        id: 'planTask10', title: 'YouTube: Upload & Promote New Video', time: '7:00 P.M. - 8:00 P.M.', project: 'Content Creation', icon: 'video_library', iconColor: 'text-red-600', type: 'multi-step', progress: 0.5, steps: [
          { id: 'ppt10s1', title: 'Final video edit check', completed: true }, { id: 'ppt10s2', title: 'Upload to YouTube', completed: true }, { id: 'ppt10s3', title: 'Write description & tags', completed: false }, { id: 'ppt10s4', title: 'Share on social media', completed: false }
        ]
      },
      {
        id: 'planTask11', title: 'Dinner', time: '8:00 P.M. - 8:45 P.M.', project: 'Personal', icon: 'dinner_dining', iconColor: 'text-orange-500', type: 'single-step'
      },
      {
        id: 'planTask12', title: 'Entertainment: Watch Movie', time: '9:00 P.M. - 10:30 P.M.', project: 'Personal', icon: 'movie', iconColor: 'text-yellow-500', type: 'single-step'
      },
      // Other
      {
        id: 'planTask13', title: 'Other: Plan Tomorrow\'s Schedule', time: '10:30 P.M. - 10:45 P.M.', project: 'Personal', icon: 'event_note', iconColor: 'text-gray-500', type: 'single-step'
      },
      {
        id: 'planTask14', title: 'Entertainment: Social Media Catch-up', time: '10:45 P.M. - 11:15 P.M.', project: 'Personal', icon: 'public', iconColor: 'text-blue-400', type: 'single-step'
      },
      // Daily Routine
      {
        id: 'planTask15', title: 'Bedtime Routine & Sleep', time: '11:30 P.M. - 11:59 P.M.', project: 'Personal', icon: 'hotel', iconColor: 'text-blue-600', type: 'single-step' // hotel for bed/sleep
      },
    ];

    return tasks.map(task => {
      const parts = task.title.split(': ');
      if (parts.length > 1) {
        // Check if the first part is a likely category (e.g., starts with uppercase, is a single word or few words)
        // For simplicity, we'll assume any title with ": " is a category prefix.
        // A more robust check might involve a list of known categories.
        return { ...task, title: parts.slice(1).join(': ') }; // Join back in case title itself had colons
      }
      return task;
    });
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

