const inputBox = document.getElementById('input-habit-title');

async function createHabit (){

    const value = inputBox.value;
    inputBox.value = '';

    const res = await fetch('/habits/create', {
        method: "post",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: value})
    });

    const data = await res.json();


    // TODO: prepend data into hait-list-container
    if(data.status == 'successful'){
        habits.push(data.data[0]);
        renderHabits();
    }else{
        console.log('Error: ', data.message);
    }

}