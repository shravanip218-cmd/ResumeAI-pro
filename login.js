/*=========================================
        ResumeAI Pro - Login
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const remember = document.getElementById("remember");

    const loginBtn = document.getElementById("loginBtn");
    const loginText = document.getElementById("loginText");
    const loadingSpinner = document.getElementById("loadingSpinner");

    const togglePassword = document.getElementById("togglePassword");

    /*==============================
        SHOW / HIDE PASSWORD
    ==============================*/

    togglePassword.addEventListener("click", () => {

        if(password.type === "password"){

            password.type = "text";
            togglePassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

        }else{

            password.type = "password";
            togglePassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

        }

    });

    /*==============================
        REMEMBER EMAIL
    ==============================*/

    if(localStorage.getItem("rememberEmail")){

        email.value = localStorage.getItem("rememberEmail");
        remember.checked = true;

    }

    /*==============================
        LOGIN
    ==============================*/

    loginForm.addEventListener("submit",(e)=>{

        e.preventDefault();

        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();

        const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(emailValue===""){

            showToast("Please enter your email.","error");
            email.focus();
            return;

        }

        if(!emailPattern.test(emailValue)){

            showToast("Invalid email address.","error");
            email.focus();
            return;

        }

        if(passwordValue.length<8){

            showToast("Password must be at least 8 characters.","error");
            password.focus();
            return;

        }

        /* Remember Email */

        if(remember.checked){

            localStorage.setItem(
                "rememberEmail",
                emailValue
            );

        }else{

            localStorage.removeItem(
                "rememberEmail"
            );

        }

        /* Loading */

        loginText.style.display="none";
        loadingSpinner.style.display="inline-block";

        loginBtn.disabled=true;

        setTimeout(()=>{

            loadingSpinner.style.display="none";
            loginText.style.display="inline-block";

            loginBtn.disabled=false;

            showToast("Login Successful!","success");

            setTimeout(()=>{

                window.location.href="/dashboard";

            },1500);

        },1800);

    });

    /*==============================
        ENTER KEY
    ==============================*/

    document.addEventListener("keydown",(e)=>{

        if(e.key==="Enter"){

            loginForm.requestSubmit();

        }

    });

});


/*=========================================
            TOAST
=========================================*/

function showToast(message,type){

    const oldToast=document.querySelector(".toast");

    if(oldToast){

        oldToast.remove();

    }

    const toast=document.createElement("div");

    toast.className="toast";

    toast.innerHTML=message;

    toast.style.position="fixed";
    toast.style.top="25px";
    toast.style.right="25px";
    toast.style.padding="16px 25px";
    toast.style.borderRadius="12px";
    toast.style.fontWeight="600";
    toast.style.color="#fff";
    toast.style.zIndex="9999";
    toast.style.boxShadow="0 15px 35px rgba(0,0,0,.25)";
    toast.style.transition=".4s";

    if(type==="success"){

        toast.style.background="#16a34a";

    }else{

        toast.style.background="#dc2626";

    }

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.remove();

    },3000);

}