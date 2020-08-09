var form = document.getElementById('form');
var tasksCounter = 0;

{/* <li class="list-group-item">
    <div class="custom-control custom-checkbox mr-sm-2">
        <input type="checkbox" class="custom-control-input" id="customControlAutosizing1">
        <label class="custom-control-label" for="customControlAutosizing1">Dapibus ac facilisis</label>
    </div>
</li> */}

function appendTasksToDOM(result) {
    let html = '';
    result.tasks.forEach(task => {
        html += `<li class="list-group-item">
                    <div class="custom-control custom-checkbox mr-sm-2">
                        <input type="checkbox" class="custom-control-input" id="customControl${++tasksCounter}">
                        <label class="custom-control-label" for="customControl${tasksCounter}">${task.name}</label>
                    </div>
                </li>`

        // html += '<li class="list-group-item">' + 
        //             '<div class="custom-control custom-checkbox mr-sm-2">' + 

        //             '</div>' +
        //         '</li>'
    });
    document.getElementById('list').innerHTML = html;
    document.getElementById('badgeTasksCounter').innerText = tasksCounter;
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
    let taskText = document.getElementById('inputTask').value;
    // if (taskText === undefined || taskText === "") e.preventDefault();

    if (taskText === '') return;

    console.log(taskText);

    addTask(taskText);
});