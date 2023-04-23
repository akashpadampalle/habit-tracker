const habitListContainer = document.querySelector('.habit-list-container');

async function getAllHabitsOfUser(){
    const res = await fetch('/habits/get', {
        method: 'GET'
    });

    const data = await res.json();
    console.log(data.data);
}

getAllHabitsOfUser();

habitListContainer.addEventListener('click', async (e) => {
    let target = e.target;

    if(target.classList.contains('fa-pen-to-square') || target.classList.contains('fa-angle-down') || target.classList.contains('fa-trash')){
        target = target.parentElement;
    }

    if(target.classList.contains('expand')){
        displayCotrollerOfRecords(target);
    }
})


function displayCotrollerOfRecords (target) {
    const recordContainer = target.parentElement.parentElement.nextElementSibling;
    const displayValue = window.getComputedStyle(recordContainer).getPropertyValue("display");

    if(displayValue == 'none'){ recordContainer.style.display = "flex"; }
    else{ recordContainer.style.display = "none";  }
}