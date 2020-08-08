var form = document.getElementById('form');

function appendTasksToDOM(result) {
    let html = '';
    result.tasks.forEach(task => {
        html += '<li>' + task.name + '</li>'
    });
    document.getElementById('list').innerHTML = html;
}

function loadTodoList() {
    $.ajax({
        url: '/getTodoList',
        success: function (result) { // result returns an array with the user tasks
            console.log(result);
            appendTasksToDOM(result);
        }, 
        error: function (error) {
            console.log(error);
        }
    });
}

function addTask(task) {
    $.ajax({
        method: 'POST',
        url: '/addTask',
        // type: 'POST',
        data: { task: task },
        success: function (result) {
            console.log(result);
            appendTasksToDOM(result);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // load todo list
    loadTodoList();
});

form.addEventListener('submit', (e) => {
    e.preventDefault(); // do not reload page
    var taskText = document.getElementById('taskText').value;
    // if (taskText === undefined || taskText === "") e.preventDefault();

    if (taskText === '') return;

    console.log(taskText);

    addTask(taskText);
});