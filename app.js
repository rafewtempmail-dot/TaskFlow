class TaskTracker {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentView = 'board';
        this.editingTask = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchView(e.target.closest('.nav-item').dataset.view);
            });
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTasks(e.target.value);
        });

        // Sidebar toggle (mobile)
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Close modal on outside click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active nav item
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update view title
        document.getElementById('currentView').textContent = 
            view === 'board' ? 'Board View' : 'List View';

        // Show/hide views
        document.getElementById('boardView').classList.toggle('hidden', view !== 'board');
        document.getElementById('listView').classList.toggle('hidden', view !== 'list');

        this.render();
    }

    openTaskModal(task = null) {
        this.editingTask = task;
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        
        if (task) {
            document.getElementById('modalTitle').textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
        } else {
            document.getElementById('modalTitle').textContent = 'New Task';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.editingTask = null;
    }

    saveTask() {
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            status: document.getElementById('taskStatus').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            createdAt: new Date().toISOString()
        };

        if (this.editingTask) {
            // Update existing task
            const index = this.tasks.findIndex(t => t.id === this.editingTask.id);
            this.tasks[index] = { ...this.tasks[index], ...taskData };
        } else {
            // Create new task
            taskData.id = Date.now().toString();
            this.tasks.push(taskData);
        }

        this.saveToStorage();
        this.closeTaskModal();
        this.render();
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveToStorage();
            this.render();
        }
    }

    saveToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    filterTasks(searchTerm) {
        const filtered = this.tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.render(filtered);
    }

    render(tasksToRender = null) {
        const tasks = tasksToRender || this.tasks;
        
        if (this.currentView === 'board') {
            this.renderBoardView(tasks);
        } else {
            this.renderListView(tasks);
        }
    }

    renderBoardView(tasks) {
        const columnsContainer = document.getElementById('boardColumns');
        const columns = [
            { id: 'todo', title: 'To Do', status: 'todo' },
            { id: 'inprogress', title: 'In Progress', status: 'inprogress' },
            { id: 'done', title: 'Done', status: 'done' }
        ];

        columnsContainer.innerHTML = columns.map(column => {
            const columnTasks = tasks.filter(task => task.status === column.status);
            
            return `
                <div class="board-column">
                    <div class="column-header">
                        <span class="column-title">${column.title}</span>
                        <span class="column-count">${columnTasks.length}</span>
                    </div>
                    <div class="column-tasks">
                        ${columnTasks.map(task => this.createTaskCard(task)).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to task cards
        this.attachTaskCardListeners();
    }

    renderListView(tasks) {
        const taskList = document.getElementById('taskList');
        
        taskList.innerHTML = tasks.map(task => `
            <div class="task-list-item" data-task-id="${task.id}">
                <div class="task-list-info">
                    <div class="task-list-title">${task.title}</div>
                    ${task.description ? `<div class="task-list-description">${task.description}</div>` : ''}
                </div>
                <div class="task-list-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    ${task.dueDate ? `<span>${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
        `).join('');

        // Add event listeners to task items
        document.querySelectorAll('.task-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const taskId = item.dataset.taskId;
                const task = this.tasks.find(t => t.id === taskId);
                this.openTaskModal(task);
            });
        });
    }

    createTaskCard(task) {
        return `
            <div class="task-card" data-task-id="${task.id}">
                <div class="task-card-title">${task.title}</div>
                ${task.description ? `<div class="task-card-description">${task.description}</div>` : ''}
                <div class="task-card-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    ${task.dueDate ? `<span>${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
        `;
    }

    attachTaskCardListeners() {
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', () => {
                const taskId = card.dataset.taskId;
                const task = this.tasks.find(t => t.id === taskId);
                this.openTaskModal(task);
            });
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TaskTracker();
});