let habits = [];
const habitListContainer = document.querySelector('.habit-list-container');


async function getAllHabitsOfUser() {
    const res = await fetch('/habits/get', { method: 'GET' });

    const data = await res.json();
    if (data.status == 'successful') { 
        habits = data.data;
        renderHabits(); 
    }
    else { 
        alert('unable to fetch habits'); 
    }
}

getAllHabitsOfUser();

function renderHabits() {

    habitListContainer.innerHTML = '';

    for (let i = 0; i < habits.length; i++) {
        const habitItem = document.createElement('div');
        habitItem.classList.add('habit-item');
        habitItem.setAttribute('id', habits[i]._id);

        const habitNumberElement = document.createElement('div');
        habitNumberElement.classList.add('habit-number');
        habitNumberElement.innerHTML = `${habits.length-i}`;
        habitItem.append(habitNumberElement);


        const habitContaintElement = document.createElement('div');
        habitContaintElement.classList.add('habit-containt');
        habitContaintElement.setAttribute('data-id', habits[i]._id);
        habitContaintElement.innerHTML = `
                        <div class="habit-header">
                            <div class="habit-title">
                                <input class="habit-title-input" type="text" value="${habits[i].title}" disabled>
                                <button class="save-habit-title-btn" data-id="${habits[i]._id}" data-index="${i}">save</button>
                            </div>
                            <div class="habit-tools" >
                                <button class="edit" title="edit habit title"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button class="delete" title="delete habit" data-id="${habits[i]._id}" data-index="${i}"><i class="fa-solid fa-trash"></i></button>
                                <button class="expand" title="expand habit records"><i class="fa-solid fa-angle-down"></i></button>
                            </div>
                        </div>
        `;

        const habitRecordContainerElement = document.createElement('div');
        habitRecordContainerElement.classList.add('habit-record-container');
        habitRecordContainerElement.setAttribute('data-habitid',  habits[i]._id);

        for(let j = 0; j<habits[i].records.length; j++){
            const habitRecordItemElement = document.createElement('div');
            habitRecordItemElement.classList.add('habit-record-item');
            habitRecordItemElement.setAttribute('id', habits[i].records[j]._id);
            habitRecordItemElement.setAttribute('data-recordindex', j);
            habitRecordItemElement.setAttribute('data-habitIndex', i);
            habitRecordItemElement.setAttribute('data-status', habits[i].records[j].status);
            
            const status = habits[i].records[j].status;
            let statusClass = undefined;
            let statusIcon = undefined;

            if(status == 'done'){ 
                statusClass = 'habit-record-status-done'; 
                statusIcon = '<i class="fa-solid fa-clipboard-check"></i>';
            }
            else if(status == 'none') { 
                statusClass = 'habit-record-status-none'; 
                statusIcon = '<i class="fa-sharp fa-solid fa-ghost"></i>';
            }
            else { 
                statusClass = 'habit-record-status-not-done'
                statusIcon = '<i class="fa-sharp fa-solid fa-clipboard-question"></i>';
            }
    
            habitRecordItemElement.innerHTML = `<div class="habit-record-date">${(new Date(habits[i].records[j].date)).getDate()}</div>
            <div class="habit-record-status ${statusClass}"> ${status} ${statusIcon}</i></div>`;

            habitRecordContainerElement.append(habitRecordItemElement);
        }

        habitContaintElement.append(habitRecordContainerElement)
        habitItem.append(habitContaintElement);

        habitListContainer.prepend(habitItem);
        
    }
}



habitListContainer.addEventListener('click', async (e) => {
    let target = e.target;

    if (target.classList.contains('fa-pen-to-square') || target.classList.contains('fa-angle-down') || target.classList.contains('fa-trash') || target.classList.contains('fa-clipboard-check') || target.classList.contains('fa-ghost') || target.classList.contains('fa-clipboard-question')) { 
        target = target.parentElement; 
    }

    if(target.classList.contains('habit-record-date') || target.classList.contains('habit-record-status')){
        target = target.parentElement;
    }

    if (target.classList.contains('expand')) { toggleRecords(target); return; }
    if(target.classList.contains('edit')){ toggleTitleBox(target); return;}
    if(target.classList.contains('delete')){ deleteHabit(target); return;}
    if(target.classList.contains('save-habit-title-btn')){editTitle(target); return;}
    if(target.classList.contains('habit-record-item')){ updateRecordStatus(target); return;}
})

async function deleteHabit(target){
    const habitId = target.dataset.id;
    const index = target.dataset.index;

    const res = await fetch('/habits/delete', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({'habitId': habitId})
    });

    const data = await res.json();
    if(data.status == 'successful'){
        habits.splice(index, 1);
        renderHabits();
    }else{
        alert(data.message);
    }
}

function toggleRecords(target) {
    const recordContainer = target.parentElement.parentElement.nextElementSibling;
    const displayValue = window.getComputedStyle(recordContainer).getPropertyValue("display");

    if (displayValue == 'none') { recordContainer.style.display = "flex"; }
    else { recordContainer.style.display = "none"; }
}


function toggleTitleBox(target){
    const habitTitleInpuBox = target.parentElement.previousElementSibling.firstElementChild;
    const saveHabitTitleBtn = target.parentElement.previousElementSibling.lastElementChild;


    if(habitTitleInpuBox.disabled){
        habitTitleInpuBox.disabled = false;
        saveHabitTitleBtn.style.display = 'inline';
    }else{
        habitTitleInpuBox.disabled = true;
        saveHabitTitleBtn.style.display = 'none';
    }
}


async function editTitle(target){
    const titleBox = target.previousElementSibling;
    const title = titleBox.value;
    const habitId = target.dataset.id;
    const index = target.dataset.index;

    
    const res =  await fetch('/habits/update-title', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'newTitle': title,
            'habitId': habitId
        })
    });

    const data = await res.json();

    if(data.status == 'successful'){ habits[index].title = title; }
    else{ titleBox.value = habits[index].title; }

    titleBox.disabled = true;
    target.style.display = 'none';
}

async function updateRecordStatus(target){
    const recordsId = target.getAttribute('id');
    const habitId = target.parentElement.dataset.habitid;
    const currentStatus = target.dataset.status;
    

    if(currentStatus == 'none'){
        const res = await fetch('/habits/update-status', {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                "newStatus": 'done',
                "habitId" : habitId,
                "recordsId" : recordsId
            })
        });

        const data = await res.json();

        if(data.status == 'successful'){
            const habitIndex = target.dataset.habitindex;
            const recordIndex = target.dataset.recordindex;

            habits[habitIndex].records[recordIndex].status = 'done';
            target.dataset.status = 'done';

            const statusElement = target.lastElementChild;
            statusElement.classList.remove('habit-record-status-none');
            statusElement.classList.add('habit-record-status-done');

            statusElement.innerHTML = `done <i class="fa-solid fa-clipboard-check"></i>`;
        }else{
            alert(data.message);
        }

    }else if(currentStatus == 'done'){

        const res = await fetch('/habits/update-status', {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                "newStatus": 'not done',
                "habitId" : habitId,
                "recordsId" : recordsId
            })
        });

        const data = await res.json();

        if(data.status == 'successful'){
            const habitIndex = target.dataset.habitindex;
            const recordIndex = target.dataset.recordindex;

            habits[habitIndex].records[recordIndex].status = 'not done';
            target.dataset.status = 'not done';

            const statusElement = target.lastElementChild;
            statusElement.classList.remove('habit-record-status-done');
            statusElement.classList.add('habit-record-status-not-done');

            statusElement.innerHTML = `not done <i class="fa-sharp fa-solid fa-clipboard-question"></i>`;
        }else{
            alert(data.message);
        }

    }else{        
        const res = await fetch('/habits/update-status', {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                "newStatus": 'none',
                "habitId" : habitId,
                "recordsId" : recordsId
            })
        });

        const data = await res.json();

        if(data.status == 'successful'){
            const habitIndex = target.dataset.habitindex;
            const recordIndex = target.dataset.recordindex;

            habits[habitIndex].records[recordIndex].status = 'none';
            target.dataset.status = 'none';

            const statusElement = target.lastElementChild;
            statusElement.classList.remove('habit-record-status-not-done');
            statusElement.classList.add('habit-record-status-none');

            statusElement.innerHTML = `none <i class="fa-sharp fa-solid fa-ghost"></i>`;
        }else{
            alert(data.message);
        }
    }
}
