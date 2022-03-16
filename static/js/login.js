login = {
    formStyle() {

    },
    sendLoginReq() {
        login = document.getElementById("loginInput").value
        password = document.getElementById("passwordInput").value

        // закодировать пароль перед отправкой

        var data = {
            Login: login,
            Password: password,
        }

        let url = "/api/login";
        let response = fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log("data = ", data);
                if (data.status === 302) {
                    alert("ты меня давай не взламывай ок да?")
                }
                if (data.status >= 399) {
                    alert("bad login or password")
                    location.reload()
                    return
                } else {
                    window.location.replace("http://localhost:8085/static/pages/manager.html")
                }
                return data
            });
        console.log("end sendloginReq")
    }
}