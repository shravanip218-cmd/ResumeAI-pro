/*=========================================
        ResumeAI Pro Dashboard
=========================================*/

document.addEventListener("DOMContentLoaded", function () {

    /*==============================
            LIVE DATE & TIME
    ==============================*/

    function updateDateTime() {

        const currentDate = document.getElementById("currentDate");

        if (!currentDate) return;

        const now = new Date();

        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        };

        currentDate.innerHTML =
            now.toLocaleDateString("en-IN", options) +
            " | " +
            now.toLocaleTimeString();

    }

    updateDateTime();

    setInterval(updateDateTime, 1000);

    /*==============================
        GOOD MORNING MESSAGE
    ==============================*/

    const username = document.querySelector(".username");

    if (username) {

        const hour = new Date().getHours();

        let greeting = "Welcome";

        if (hour < 12) {

            greeting = "Good Morning";

        } else if (hour < 17) {

            greeting = "Good Afternoon";

        } else {

            greeting = "Good Evening";

        }

        username.innerHTML = "Shravani 👋 <br><small>" + greeting + "</small>";

    }

    /*==============================
        COUNTER ANIMATION
    ==============================*/

    const counters = document.querySelectorAll(".stat-card h2");

    counters.forEach(counter => {

        const target = parseInt(counter.innerText);

        if (isNaN(target)) return;

        let count = 0;

        const speed = target / 60;

        const update = () => {

            if (count < target) {

                count += speed;

                counter.innerText = Math.floor(count);

                requestAnimationFrame(update);

            } else {

                counter.innerText = target;

            }

        };

        update();

    });

    /*==============================
        PROGRESS BAR
    ==============================*/

    const progressBars =
        document.querySelectorAll(".progress-fill");

    progressBars.forEach(bar => {

        const width = bar.style.width;

        bar.style.width = "0";

        setTimeout(() => {

            bar.style.width = width;

        }, 400);

    });

    /*==============================
        NOTIFICATION
    ==============================*/

    const notification =
        document.querySelector(".notification-btn");

    if (notification) {

        notification.addEventListener("click", function () {

            showToast(
                "No new notifications.",
                "info"
            );

        });

    }

    /*==============================
            SEARCH
    ==============================*/

    const search =
        document.querySelector(".search-box input");

    if (search) {

        search.addEventListener("keyup", function () {

            console.log("Searching : " + this.value);

        });

    }

    /*==============================
        SIDEBAR ACTIVE
    ==============================*/

    const menu =
        document.querySelectorAll(".sidebar ul li");

    menu.forEach(item => {

        item.addEventListener("click", function () {

            menu.forEach(i => {

                i.classList.remove("active");

            });

            this.classList.add("active");

        });

    });

    /*==============================
        WELCOME TOAST
    ==============================*/

    setTimeout(() => {

        showToast(
            "Welcome to ResumeAI Pro Dashboard!",
            "success"
        );

    }, 700);

});


/*=========================================
            TOAST FUNCTION
=========================================*/

function showToast(message, type) {

    const old =
        document.querySelector(".dashboard-toast");

    if (old) old.remove();

    const toast =
        document.createElement("div");

    toast.className = "dashboard-toast";

    toast.innerHTML = message;

    toast.style.position = "fixed";
    toast.style.top = "25px";
    toast.style.right = "25px";
    toast.style.padding = "15px 25px";
    toast.style.borderRadius = "12px";
    toast.style.color = "#fff";
    toast.style.fontWeight = "600";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 15px 30px rgba(0,0,0,.25)";
    toast.style.transition = ".4s";

    if (type === "success") {

        toast.style.background = "#16a34a";

    } else if (type === "error") {

        toast.style.background = "#dc2626";

    } else {

        toast.style.background = "#2563eb";

    }

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}