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

function getExpiredTasks(result) {
    let expiredTasks = [];
    result.tasks.forEach(task => {
        // let taskDate = new firebase.firestore.Timestamp(task.date._seconds, task.date._nanoseconds).toDate().toDateString();
        // let curDate = new Date().toDateString();

        // console.log(task);

        let taskDateAux = new firebase.firestore.Timestamp(task.date._seconds, task.date._nanoseconds).toDate();
        let curDateAux = new Date();

        let taskDateMonth = taskDateAux.getMonth() + 1 < 10 ? '0' + (taskDateAux.getMonth() + 1) : taskDateAux.getMonth() + 1;
        let curDateMonth = curDateAux.getMonth() + 1 < 10 ? '0' + (curDateAux.getMonth() + 1) : curDateAux.getMonth() + 1;

        let taskDate = `${taskDateAux.getFullYear()}-${taskDateMonth}-${taskDateAux.getDate()}`;
        let curDate = `${curDateAux.getFullYear()}-${curDateMonth}-${curDateAux.getDate()}`;

        if (taskDate < curDate) {
            // console.log(task);
            expiredTasks.push(task);
        }
    });
    return expiredTasks;
}

function deleteExpiredTasks(expiredTasks) {
    $.ajax({
        method: 'POST',
        url: '/deleteExpiredTasks',
        data: { expiredTasks: expiredTasks },
        success: function (result) {
            console.log(result);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function appendTasksToDOM(html) {
    document.getElementById('todayList').innerHTML = html;
    document.getElementById('badgeTasksCounter').innerText = todayTasksCounter;
}

function loadTodoList() {
    $.ajax({
        url: '/getTodoList',
        success: function (result) { // result returns an array with the user tasks
            // console.log(result);
            let html = getTodayList(result);
            appendTasksToDOM(html);

            let expiredTasks = getExpiredTasks(result);
            if (expiredTasks.length != 0) deleteExpiredTasks(expiredTasks);
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
        data: { task: task, date: date },
        success: function (result) {
            // console.log(result);
            // appendTasksToDOM(result);
            let html = getTodayList(result);
            appendTasksToDOM(html);
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
    let inputTaskDate = document.getElementById('inputTaskDate');
    let curDate = new Date();
    let day = curDate.getDate();
    let month = curDate.getMonth() + 1 < 10 ? '0' + (curDate.getMonth() + 1) : curDate.getMonth() + 1;
    let year = curDate.getFullYear();
    // inputTaskDate.min = '2020-08-10';
    inputTaskDate.min = `${year}-${month}-${day}`;
});

form.addEventListener('submit', (e) => {
    e.preventDefault(); // do not reload page
    let taskText = document.getElementById('inputTask').value;
    let taskDateValue = document.getElementById('inputTaskDate').value;

    if (taskText === '' || taskDateValue === '') return;

    console.log(taskText);
    console.log(taskDateValue);

    let dateAux = String(taskDateValue).split('-');
    let taskDate = new Date(dateAux[0], dateAux[1] - 1, dateAux[2]);

    console.log(taskDate);

    addTask(taskText, taskDate);
    document.getElementById('inputTask').value = '';
});