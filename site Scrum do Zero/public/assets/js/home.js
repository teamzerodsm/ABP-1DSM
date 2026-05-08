const btnAcessar = document.getElementById('access-btn')
const mobileCardSec = document.getElementById('login-card-sec') 

function hidden(){
    mobileCardSec.classList.remove('hidden')
}

btnAcessar.addEventListener('click', ()=>{
    hidden()
})

const form = document.querySelector(".form-login");

const inputs = form.querySelectorAll("input");

const emailRegex = /^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/
