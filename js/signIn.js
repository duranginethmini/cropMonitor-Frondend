$(document).ready(function () {
    $('#form').on('submit', function (event) {
        event.preventDefault();
        userLogin();
    });

    const registerBtn = document.getElementById("register-btn");
    if (registerBtn) {
        registerBtn.addEventListener("click", function () {
            window.location.href = "/pages/signup.html";
        });
    }
});

function userLogin() {
    const email = $("#email").val().trim();
    const password = $("#password").val().trim();
    const role = $("#role").val().trim();

    if (!email || !password) {
        alert("Email and Password are required!");
        return;
    }

    $.ajax({
        url: "http://localhost:5050/cropMonitor/api/v1/auth/signin",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            email: email,
            password: password,
            role: role,
        }),
        success: function (response) {
            if (response && response.token) {
                localStorage.setItem('jwtToken', response.token);
                console.log("JWT token saved:", response.token);

                // Redirect based on role
                if (role === "ADMINISTRATIVE") {
                    window.location.href = "../pages/adminDashboard.html";
                } else if (role === "MANAGER") {
                    window.location.href = "../pages/managerDashboard.html";
                } else if (role === "SCIENTIST") {
                    window.location.href = "../pages/scientistDashboard.html";
                } else {
                    alert("Invalid role selected.");
                }
            } else {
                alert("Invalid server response.");
            }
        },
        error: function (error) {
            console.error("Error during login:", error);
            alert("Login failed. Please check your email and password.");
        }
    });
}