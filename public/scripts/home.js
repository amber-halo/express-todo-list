var form = document.getElementById('form');

document.addEventListener('DOMContentLoaded', () => {
    // load todo list
    $.ajax({
        url: '/getTodoList',
        success: function (result) {
            console.log(result);
            // console.log(result.tasks);
            let html = '';
            result.tasks.forEach(task => {
                html += '<li>' + task + '</li>'
            });
            document.getElementById('list').innerHTML = html;
        }, 
        error: function (error) {
            console.log(error);
        }
    });
});

form.addEventListener('submit', (e) => {
    var taskText = document.getElementById('taskText').value;
    if (taskText === undefined || taskText === "") e.preventDefault();

    console.log(taskText);
});