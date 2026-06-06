const btnAcessar = document.getElementById('access-btn')
const mobileCardSec = document.getElementById('login-card-sec') 

const apiUrl = 'api/auth/login';

function hidden(){
    mobileCardSec.classList.remove('hidden')
}

btnAcessar.addEventListener('click', ()=>{
    hidden()
})

