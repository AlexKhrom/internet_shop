bag = {
    calcPrice: function (n) {
        s = 0;
        this.n = n;
        for (i = 0; i < parseInt(n); i++) {
            str = "productPrice" + i;
            s += parseFloat(document.getElementById(str).innerHTML);
        }
        document.getElementById("endPrice").innerHTML = s + " руб.";
        document.getElementById("notEndPrice").innerHTML = s + " руб.";
        document.getElementById("allPriceUpper").innerHTML = s + " руб.";
    },
    n: 0,
    multiPrice: function (i, that) {

        //in localstorage change num of product

        products = localStorage.getItem("productsInBag").split('"').join('').split(',');

        var newProductsList = "";
        var lastNum;
        for (j = 0; j < products.length; j++) {
            product = products[j].split(":");
            if (j !== 0) {
                newProductsList += ","
            }
            if (j === i) {
                lastNum = product[1]
                product[1] = that.value
            }
            newProductsList += product[0] + ":" + product[1];
        }

        localStorage.setItem("productsInBag", newProductsList);

        str = "productPrice" + i;
        document.getElementById(str).innerHTML = that.value * parseFloat(document.getElementById(str).innerHTML) / lastNum + " руб.";

        this.calcPrice(this.n);
    },
    async printProducts() {
        products = localStorage.getItem("productsInBag");

        document.getElementById("listOfProducts").innerHTML = "";

        if (products === null) { // empty bag
            document.getElementById("productsInbag").innerHTML = "Ваша корзина пока пуста."
            return
        }

        products = localStorage.getItem("productsInBag").split('"').join('').split(',');
        console.log("local storage", localStorage.getItem("productsInBag"));

        for (i = 0; i < products.length; i++) {

            product = products[i].split(":")

            productId = product[0]
            numProduct = product[1]
            nameId = "product" + (i + 1)


            productStruct = await this.getProduct(productId)
            console.log("prodStruct = ", productStruct)
            // let productStruct = JSON.parse(this.getProduct(productId), function (key, value) {
            //     return value;
            // });


            document.getElementById("listOfProducts").innerHTML += "<li id='" + nameId + "'>\n" +
                "                        <ul class=\"productUl\">\n" +
                "                            <li><img src=\"../" + productStruct.url + "\" width=\"190px\"></li>\n" +
                "                            <li>\n" +
                "                                <div class=\"descriptionProduct\">\n" +
                "                                    <h4>\n" +
                "                                        " + productStruct.name + "</h4>\n" +
                "                                    <h4>\n" +
                "                                        <select id='selectNum" + i + "' onchange=\"bag.multiPrice(" + i + ",this)\">\n" +
                "                                            <option value=\"1\">1</option>\n" +
                "                                            <option value=\"2\">2</option>\n" +
                "                                            <option value=\"3\">3</option>\n" +
                "                                            <option value=\"4\">4</option>\n" +
                "                                            <option value=\"5\">5</option>\n" +
                "                                            <option value=\"6\">6</option>\n" +
                "                                            <option value=\"7\">7</option>\n" +
                "                                            <option value=\"8\">8</option>\n" +
                "                                            <option value=\"9\">9</option>\n" +
                "                                            <option value=\"10\">10</option>\n" +
                "                                        </select>\n" +
                "                                    </h4>\n" +
                "                                    <h4 id=\"productPrice" + i + "\">" + productStruct.price * numProduct + " pyб.</h4>\n" +
                "                                    <button class=\"ui secondary button\" onclick='bag.deleteProduct(" + (productId) + ")' style=\"margin-top: 20px;\">\n" +
                "                                        удалить из корзины\n" +
                "                                    </button>\n" +
                "                                </div>\n" +
                "                            </li>\n" +
                "                        </ul>\n" +
                "                    </li>";

        }

        if (products.length > 0) {
            document.getElementById("listOfProducts").innerHTML += "<li>\n" +
                "                        <ul class=\"arrangeOrder\">\n" +
                "                            <li>\n" +
                "                                <h3>Промежуточная стоимость <a id=\"notEndPrice\">79 990.00 pyб.</a></h3>\n" +
                "                                <h3>Доставка <a>БЕСПЛАТНО</a></h3>\n" +
                "                                <h3 >Общая стоимость <a id=\"endPrice\">79 990.00 pyб.</a></h3>\n" +
                "                                <a href=\"checkout.html\">\n" +
                "                                    <button class=\"ui primary button\" id=\"arrangeOrder\">\n" +
                "                                        Оформить заказ\n" +
                "                                    </button>\n" +
                "                                </a>\n" +
                "                            </li>\n" +
                "                        </ul>\n" +
                "                    </li>"

        }

        for (i = 0; i < products.length; i++) {
            product = products[i].split(":")

            productId = product[0]
            numProduct = product[1]

            idSelect = "selectNum" + i;
            this.setSelect(idSelect, numProduct);
        }
        this.calcPrice(products.length);
    },
    setSelect(id, val) {
        document.getElementById(id).value = val;
    },
    deleteProduct(productId) {
        products = localStorage.getItem("productsInBag").split('"').join('').split(',');

        var newProductsList = "";
        for (i = 0; i < products.length; i++) {
            product = products[i].split(":");
            // if (j === i) {
            //     product[1] = that.value
            // }
            if (productId.toString() === product[0].toString()) {
                if (products.length === 1) {
                    localStorage.removeItem("productsInBag");
                    this.printProducts();
                    menu.printNumOfProducts();
                    return;
                }
            } else {
                newProductsList += product[0] + ":" + product[1];
                if ((i !== (products.length - 1)) && !((i === (products.length - 2)) && (productId.toString() === products[products.length - 1].split(":")[0]))) {
                    console.log("prodId = ",productId)
                    console.log("products[i] = ", products[products.length - 1].split(":")[0])
                    newProductsList += ","
                }
            }
        }

        localStorage.setItem("productsInBag", newProductsList);

        this.printProducts()
        menu.printNumOfProducts()
    },
    getProduct(id) {
        let url = "/api/giveProductUrl/" + id;
        let response = fetch(url, {
            method: "POST",
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log("data = ", data);
                console.log("price = ", data.price)
                return data
            });
        return response
        // console.log("resp = ", response)
    },
    showCookie() {
        // alert(document.cookie);
        productsId = this.getCookie("productsInBag")
        if (productsId === undefined)
            return
        productsId = this.getCookie("productsInBag").split('"').join('').split(',')

        for (i = 0; i < productsId.length; i++) {
            console.log(i, ". ", productsId[i])
        }
    },
    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
}