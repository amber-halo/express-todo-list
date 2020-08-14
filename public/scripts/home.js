var form = document.getElementById('form');
var todayTasksCounter = 0;

{/* <li class="list-group-item pr-0 d-flex justify-content-between">
        <div class="custom-control custom-checkbox mr-sm-2">
            <div>
                <input type="checkbox" class="custom-control-input" id="customControlAutosizing1">
                <label class="custom-control-label mt-2" for="customControlAutosizing1"></label>
            </div>
        </div>
        <input type="text" class="form-control mr-3">
        <p class="text-muted m-1">Today</p>
</li> */}

function getTodayList(result) {
    todayTasksCounter = 0;

    let html = '';
    result.tasks.forEach(task => {
        let taskDate = new firebase.firestore.Timestamp(task.date._seconds, task.date._nanoseconds).toDate().toDateString();
        let curDate = new Date().toDateString();
        if (taskDate === curDate) {
            html += `<li class="list-group-item pr-0 d-flex justify-content-between">
                        <div class="custom-control custom-checkbox mr-sm-2">
                            <div>
                                <input type="checkbox" class="custom-control-input" id="customControl${++todayTasksCounter}">
                                <label class="custom-control-label mt-2" for="customControl${todayTasksCounter}"></label>
                            </div>
                        </div>
                        <input type="text" value="${task.name}" class="custom-task-input mr-3">
                        <p class="text-muted m-1">Today</p>
                    </li>`
        }
    });
    return html;
}

function appendTasksToDOM(result) {
    let html = getTodayList(result);

    document.getElementById('todayList').innerHTML = html;
    document.getElementById('badgeTasksCounter').innerText = todayTasksCounter;
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

function addTask(task, date) {
    $.ajax({
        method: 'POST',
        url: '/addTask',
        // type: 'POST',
        data: { task: task, date: date },
        success: function (result) {
            console.log(result);
            // todayTasksCounter = 0;
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
    ///////////////////////////////////////////////////////////////////////////// TODO: set min date to current date
    document.getElementById('inputTaskDate').min = '2020-01-01';
});

form.addEventListener('submit', (e) => {
    e.preventDefault(); // do not reload page
    let taskText = document.getElementById('inputTask').value;
    let taskDateValue = document.getElementById('inputTaskDate').value;
    // if (taskText === undefined || taskText === "") e.preventDefault();

    if (taskText === '' || taskDateValue === '') return;

    console.log(taskText);
    console.log(taskDateValue);

    let dateAux = String(taskDateValue).split('-');
    // console.log(dateAux);
    let taskDate = new Date(dateAux[0], dateAux[1] - 1, dateAux[2]);

    console.log(taskDate);

    // console.log(new Date(taskDate));
    // console.log(typeof taskDate);

    addTask(taskText, taskDate);
    document.getElementById('inputTask').value = '';
});