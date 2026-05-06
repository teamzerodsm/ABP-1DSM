const btnAcessar = document.getElementById('access-btn')
const mobileCardSec = document.getElementById('login-card-sec') 

function hidden(){
    mobileCardSec.classList.remove('hidden')
}

btnAcessar.addEventListener('click', ()=>{
    hidden()
})
