document.addEventListener('DOMContentLoaded', () => {
    const addTaskForm = document.getElementById('addTaskForm');
    const addTaskModalEl = document.getElementById('addTaskModal');
    const addTaskModal = new bootstrap.Modal(addTaskModalEl);
    const columns = document.querySelectorAll('.kanban-column');

    let draggedTask = null;


    loadBoard();

    async function loadBoard() {
        try {
            const response = await fetch('/api/board');
            const data = await response.json();


            document.querySelectorAll('.kanban-column').forEach(container => {
                container.innerHTML = '';
            });


            data.columns.forEach(col => {
                const targetColumn = document.querySelector(`.kanban-column[data-id="${col.id}"]`) ||
                                     document.getElementById(col.name.toLowerCase().replace(/\s+/g, '-')) ||
                                     document.getElementById(col.id);
                
            
                if (targetColumn && col.tasks) {
                    col.tasks.forEach(task => {
                        const taskCard = createTaskElement(task.id, task.title, task.description);
                        targetColumn.appendChild(taskCard);
                    });
                }

            });

            updateCounts();
        }catch(error) {
            console.error('Error fetching board data: ', error);
        }
    }


    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('taskTitle');
        const descInput = document.getElementById('taskDesc');


        const title = titleInput.value.trim();
        const desc = descInput.value.trim();


        if(!title)  
            return;

        const newTaskData =  {
            title: title,
            description: desc,
            column_id: 1,
            burst_time: 1,
            priority: 1
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers : {'Content-Type': 'application/json'},
                body: JSON.stringify(newTaskData)
            });



            if (response.ok) {
                const result = await response.json();

                const taskCard = createTaskElement(result.id, title, desc);
                const todoColumn= document.querySelector('[data-id="1"]') || document.getElementById('todo') || columns[0];

                todoColumn.appendChild(taskCard);


                if (document.activeElement) {
                    document.activeElement.blur();
                }

                addTaskForm.reset();
                addTaskModal.hide();

                updateCounts();
            }
        }catch(error) {
            console.error('Error fetching board data: ', error);
        }
    });



    function createTaskElement(id, title, description) {
        const card = document.createElement('div');

        card.className = 'task-card';
        card.setAttribute('draggable', 'true');

        card.id = `task-${id}`;
        card.dataset.taskId = id;


        card.innerHTML = `
            <div class =  "d-flex justify-content-between align-items-start">
                <div class = "task-title">${escapeHtml(title)}</div>
                <button class = "btn btn-sm btn-outline-danger delete-btn py-0 px-1">&times;</button>
            </div>
            ${description ? `<p class = "task-desc mt-1 mb-0">${escapeHtml(description)}</p>` : ''}
            `;

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(id, card);
        });


        addDragEventsToTask(card);
        return card;
    }



    async function deleteTask(taskId, cardElement) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                cardElement.remove();
                updateCounts();
            }else{
                alert('Could not delete task from server.');
            }
        } catch(error) {
            console.error('Error deleting task: ', error);
            alert('Server error while deleting task.');
        }
    }




    function addDragEventsToTask(task) {
        task.addEventListener('dragstart', (e) => {
            draggedTask = task;
            task.classList.add('dragging');


            e.dataTransfer.setData('text/plain', task.id);
            e.dataTransfer.effectAllowed = 'move';
        });



        task.addEventListener('dragend', () => {
            draggedTask = null;
            task.classList.remove('dragging');
        })
    }


    columns.forEach(column => {

        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            column.classList.add('drag-over');
        });


        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });


        column.addEventListener('drop', async (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');

            if (!draggedTask)
                return

            
            const previousParent = draggedTask.parentElement;
            column.appendChild(draggedTask);


            const taskId = draggedTask.dataset.taskId;
            const rawId = column.dataset.id;
            const newColumnId = rawId ? parseInt(rawId, 10) : getColumnIdFromStatus(column.dataset.status);

                // Recalculate header column totals
            updateCounts();
                

            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        column_id: newColumnId,
                        position: Array.from(column.querySelectorAll('.task-card')).indexOf(draggedTask)
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update task');
                }

            }catch(error) {
                console.error('Error updating task location:', error);

                previousParent.appendChild(draggedTask);
                updateCounts();
            }
        });
    });





    function  getColumnIdFromStatus(status) {
        const statusMap = {
            'todo': 1,
            'in-progress': 2,
            'done': 3
        };
        return statusMap[status] || 1;
    }





    function updateCounts() {
        columns.forEach(column => {
            const status = column.dataset.status;

            const countSpan = document.getElementById(`${status}-count`);

            if (countSpan) {
                countSpan.textContent = column.querySelectorAll('.task-card').length;
            }
        });
    }




    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (match) => ({
            '&':'&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[match]));
    }


});