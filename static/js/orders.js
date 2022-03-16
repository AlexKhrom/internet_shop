let orders = {
    orders: [],
    isForm: 0,
    lastStatus: "",
    lastOrderId: 0,
    async printOrders() {
        let orders = await this.getOrders()
        this.orders = orders


        for (i = 0; i < orders.length; i++) {
            console.log("order = ", orders[i])

            document.getElementById("listOrders").innerHTML += this.printOrderString(orders[i])
        }

        this.searchOrder()


    },
    printDropdown(value) {
        var masVal = ["accepted", "processed", "delivered", "completed"];


        let str = "  <form class=\"ui form\">\n" +
            "<select class=\"ui dropdown\" onclick=\"orders.saveLastStatus(this)\" onchange=\"orders.changeStatus(this)\" >\n"
        for (let i = 0; i < 4; i++) {
            str += " <option value=\"" + masVal[i] + "\""
            if (value === masVal[i]) {
                str += "selected='selected'";
            }
            str += ">" + masVal[i] + "</option>\n";
        }
        str += " </select>\n" + "  </form>";
        return str;
    },

    saveLastOrderId(that) {
        this.lastOrderId = parseInt(that.getAttribute("orderId"))
    },
    saveLastStatus(that) {
        this.lastStatus = that.value
    },

    changeStatus(that) {
        alert(" change order#" + this.lastOrderId + " : " + this.lastStatus + " -> " + that.value)
        let url = "/api/order";
        let body = {
            id: this.lastOrderId,
            status: that.value,
        }
        let response = fetch(url, {
            method: "PUT",
            body: JSON.stringify(body),
        }).then((response) => {
            return response.json();
        })
            .then((data) => {
                return data
            });
        return response
    },

    deleteOrder(orderId) {
        let isOk = confirm("удалить заказ?")
        if (!isOk) {
            return
        }
        let url = "/api/order/" + orderId;
        return fetch(url, {
            method: "DELETE",
            body: "",
        }).then((resp) => resp.json())
            .then(function (response) {
                console.info('fetch()', response);
                return response;
            });
        this.printOrders()
    },

    printOrderString(order) {
        if (order.wayToGet === 0) {
            var wayToGet = "самовывоз"
        } else {
            wayToGet = "доставка"
        }

        let adress = this.makeAdress(order);

        return " <li onclick=\"orders.saveLastOrderId(this)\" orderId=\"" + order.id + "\">\n" +
            " <h1>Заказ #<a>" + order.id + "</a><img onclick=\"orders.deleteOrder(" + order.id + ")\" src=\"../images/icons8-trash-can-30.png\"></h1>\n" +
            " <h2>Статус <a>" + this.printDropdown(order.status) + "</a></h2>" +
            "  <ul class=\"aboutOrder\">\n" +
            "     <li><a>Продукты:</a> <a>Xiaomi powerbank white, Xiaomi powerbank black</a></li>\n" +
            "      <li><a>Способ получения:</a> <a>" + wayToGet + "</a></li>\n" +
            "     <li><a>Адрес:</a> <a>" + adress + "</a></li>\n" +
            "      <li><a>Сумма заказа:</a> <a>" + order.price + "</a></li>\n" +
            "      <li><a>Имя получателя:</a> <a>" + order.lastname + " " + order.firstname + "</a></li>\n" +
            "      <li><a>Телефон получателя:</a> <a>" + order.phone + "</a></li>\n" +
            "      <li><a>Адрес подтверждения:</a> <a>" + order.billEmail + order.billPhone + "</a></li>\n" +
            "      <li><a>Описание:</a> <p>" + order.description + "</p></li>\n" +
            " </ul>\n" +
            " </li>";
    },

    makeAdress(order) {
        return adress = order.city + ", " + order.street + ", " + order.house + " , build " + order.building +
            " , corpus " + order.corpus + " , entr  " + order.entrance + " , fl " + order.floor + " , apart " + order.apartment;
    },
    searchOrder() {
        var input = document.getElementById("searchInput")

        console.log("this.orders = ", this.orders)

        var orders = this.orders
        input.oninput = this.oninputSearch
    },

    oninputSearch() {

        var input = document.getElementById("searchInput")

        let dropDown = document.getElementById("dropdownId").value

        document.getElementById("listOrders").innerHTML = ""

        for (let i = 0; i < orders.orders.length; i++) {
            if (orders.isOrderContain(orders.orders[i], dropDown, input.value)) {
                console.log("orderId = ", orders.orders[i].id)
                document.getElementById("listOrders").innerHTML += orders.printOrderString(orders.orders[i])
            }
        }
    },

    isOrderContain(order, num, str) { // сравниваем str с полем num в order
        switch (num) {
            case "0":
                if (order.id === Number(str)) {
                    return true
                }
                break;
            case "1":
                if ((order.firstname.toLowerCase() + order.lastname.toLowerCase()).includes(str.toLowerCase())) {
                    return true
                }
                break;
            case "2":
                if (order.phone.includes(str)) {
                    return true
                }
                break;
            case "3":
                if (order.billEmail.includes(str)) {
                    return true
                }
                break;
            case "4":
                if (this.makeAdress(order).toLowerCase().includes(str.toLowerCase())) {
                    return true
                }
                break;
            case "5":
                if (order.price === Number(str)) {
                    return true
                }
                break;
            case "6":
                return true
            case "7":
                if (order.description.includes(str)) {
                    return true
                }
                break
        }
        return false
    },

    printForm() {
        if (!this.isForm) {
            this.isForm = 1
            document.getElementById("form").innerHTML = "        <form class=\"ui form\">\n" +
                "                <h4 class=\"ui dividing header\">Информация по заказам</h4>\n" +
                "                <div class=\"field\">\n" +
                "                    <label>ID</label>\n" +
                "                    <div class=\"three fields\">\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[idFrom]\" placeholder=\"From\">\n" +
                "                        </div>\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[idTo]\" placeholder=\"To\">\n" +
                "                        </div>\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[status]\" placeholder=\"status\">\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"field\">\n" +
                "                    <label>Name</label>\n" +
                "                    <div class=\"two fields\">\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[firstname]\" placeholder=\"FirstName\">\n" +
                "                        </div>\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[lastname]\" placeholder=\"LastName\">\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"field\">\n" +
                "                    <label>Contacts</label>\n" +
                "                    <div class=\"two fields\">\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[phone]\" placeholder=\"Phone\">\n" +
                "                        </div>\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[email]\" placeholder=\"Email\">\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"field\">\n" +
                "                    <label>Way to get</label>\n" +
                "                    <div class=\"two fields\">\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[wayToGet]\" placeholder=\" 0 - pickUp/1 - delivery\">\n" +
                "                        </div>\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[city]\" placeholder=\"City\">\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"field\">\n" +
                "                    <label>Address</label>\n" +
                "                    <div class=\"fields\">\n" +
                "                        <div class=\"twelve wide field\">\n" +
                "                            <input type=\"text\" name=\"orders[street]\" placeholder=\"Street Address\">\n" +
                "                        </div>\n" +
                "                        <div class=\"four wide field\">\n" +
                "                            <input type=\"text\" name=\"orders[house]\" placeholder=\"House #\">\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"field\">\n" +
                "                    <div class=\"fields\">\n" +
                "                        <div class=\"four wide field\">\n" +
                "                            <input type=\"text\" name=\"orders[build]\" placeholder=\"Build\">\n" +
                "                        </div>\n" +
                "                        <div class=\"four wide field\">\n" +
                "                            <input type=\"text\" name=\"orders[corpus]\" placeholder=\"Corpus\">\n" +
                "                        </div>\n" +
                "                        <div class=\"four wide field\">\n" +
                "                            <input type=\"text\" name=\"orders[entrance]\" placeholder=\"Entrance\">\n" +
                "                        </div>\n" +
                "                        <div class=\"four wide field\">\n" +
                "                            <input type=\"text\" name=\"orders[floor]\" placeholder=\"Floor\">\n" +
                "                        </div>\n" +
                "                        <div class=\"four wide field\">\n" +
                "                            <input type=\"text\" name=\"orders[apartment]\" placeholder=\"Apartment\">\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"field\">\n" +
                "                    <label>Price</label>\n" +
                "                    <div class=\"two fields\">\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[priceFrom]\" placeholder=\"From\">\n" +
                "                        </div>\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[priceTo]\" placeholder=\"To\">\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"field\">\n" +
                "                    <label>Info</label>\n" +
                "                    <div class=\"fields\">\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[productsID]\" placeholder=\"ProductsID\">\n" +
                "                        </div>\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[payType]\" placeholder=\"Pay type(0-pickup,1-delivery)\">\n" +
                "                        </div>\n" +
                "                        <div class=\"field\">\n" +
                "                            <input type=\"text\" name=\"orders[description]\" placeholder=\"Description\">\n" +
                "                        </div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"ui button\" tabindex=\"0\" onclick=\"orders.printOrdersReq()\">Найти</div>\n" +
                "                <div class=\"ui button\" tabindex=\"0\" onclick=\"orders.printForm()\">Свернуть</div>\n" +
                "            </form>";
        } else {
            this.isForm = 0
            document.getElementById("form").innerHTML = "<div class=\"ui button\" tabindex=\"0\" style=\"margin-left: 90px\" onclick=\"orders.printForm()\">подробный поиск</div>"
        }


    },

    async printOrdersReq() {
        let orders = await this.makeRequestOrders()
        this.orders = orders

        document.getElementById("listOrders").innerHTML = ""

        for (i = 0; i < orders.length; i++) {
            console.log("order = ", orders[i])

            document.getElementById("listOrders").innerHTML += this.printOrderString(orders[i])
        }

        this.searchOrder()
    },

    makeFormOrders() {
        let ordersObj = {}

        let name = ["idFrom", "idTo", "payType", "wayToGet", "house", "priceFrom", "priceTo", "firstname", "lastname", "phone", "email", "city", "street",
            "build", "corpus", "entrance", "floor", "apartment", "productsID", "description"]

        for (let i = 0; i < name.length; i++) {
            if (i <= 4) {
                ordersObj[name[i]] = parseInt(document.getElementsByName("orders[" + name[i] + "]")[0].value)
            } else if (i <= 6) {
                ordersObj[name[i]] = parseFloat(document.getElementsByName("orders[" + name[i] + "]")[0].value)
            } else {
                ordersObj[name[i]] = document.getElementsByName("orders[" + name[i] + "]")[0].value
            }
        }
        console.log("ordersObj = ", ordersObj)
        return ordersObj
    },
    makeRequestOrders() {
        let url = "/api/orders";
        let response = fetch(url, {
            method: "POST",
            body: JSON.stringify(this.makeFormOrders())
        }).then((response) => {
            return response.json();
        })
            .then((data) => {
                console.log("data = ", data);
                return data
            });
        return response
    },

    getOrders() {
        let url = "/api/order";
        let response = fetch(url, {
            method: "GET",
        }).then((response) => {
            return response.json();
        })
            .then((data) => {
                console.log("data = ", data);
                return data
            });
        return response
    }
}