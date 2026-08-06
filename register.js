/*=========================================
        ResumeAI Pro
        Register Validation
=========================================*/

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const terms = document.getElementById("terms").checked;

    if(fullname.length < 3){
        alert("Full Name must contain at least 3 characters.");
        return;
    }

    const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(email)){
        alert("Please enter a valid email address.");
        return;
    }

    const mobilePattern =
    /^[6-9][0-9]{9}$/;

    if(!mobilePattern.test(mobile)){
        alert("Enter a valid 10-digit mobile number.");
        return;
    }

    if(password.length < 8){
        alert("Password must be at least 8 characters.");
        return;
    }

    if(password !== confirmPassword){
        alert("Passwords do not match.");
        return;
    }

    if(!terms){
        alert("Please accept Terms & Conditions.");
        return;
    }

    alert("Registration Successful!");

    registerForm.reset();

});
