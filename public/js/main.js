const habitList = document.querySelector('#habit-list');

async function main(){
    const response = await fetch('/get-habits');
    const data = await response.json();

    if(data.message == "successfully fetched habits"){
        renderHabits(data.data);
    }
    
}

main();


function renderHabits(habits){
    habitList.innerHTML = "";

    for(let habit of habits){
        const habitElement = document.createElement('li');
        habitElement.classList.add('habit-element');
        habitElement.innerHTML = `${habit.title}`;

        const habitStatus = document.createElement('div');
        habitStatus.classList.add('d-flex');
        for(let record of habit.records){
            let habitStatusChild = document.createElement('div');
            const day = (new Date(record.date)).getDate();
            habitStatusChild.innerHTML = `
                <span> ${day}</span>
                <span> ${record.status}</span>
                `;

            habitStatus.append(habitStatusChild);
        }
        habitElement.append(habitStatus);
        habitList.append(habitElement);
        
    }
}
