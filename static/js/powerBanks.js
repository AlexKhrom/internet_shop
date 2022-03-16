var products = {
    approxPrice: function () {
        str = document.getElementById("price").innerHTML.replace(/\s+/g, '');
        b = parseInt(str) * 0.167
        document.getElementById("approxPrice").innerHTML = b.toFixed(1);
    },
    async chooseColor(that, str) {

        document.getElementById("choosenProduct").setAttribute("choosenProductID", str);
        that.style = "border:3px solid rgb(28,113,187);";

        productStruct = await this.getProduct(str)

        if (this.lastChoosen === 0) {
            document.getElementById("aboutPrice").style = " animation: 2s priceInfo forwards;";
            document.getElementById("ButtonDiv").innerHTML = "  <button class=\"ui primary button\">\n" + "Добавить в корзину\n" + "</button>";
            document.getElementById("ButtonDiv").style = " animation: 2s priceInfo2 forwards;";
        }
        document.getElementById("powerBankImg").setAttribute("src", "../"+productStruct.url);
        document.getElementById("price").innerHTML = productStruct.price;
        document.getElementById("colorPowerbank").innerHTML = that.getAttribute("color");
        this.approxPrice();
        if (this.lastChoosen !== 0)
            this.lastChoosen.style = "";
        this.lastChoosen = that;
    },
    lastChoosen: 0,
    takeToBag: function () {
        // this.makeRequest()

        key = "productsInBag"
        productId = document.getElementById("choosenProduct").getAttribute("choosenProductID");
        if (localStorage.getItem(key) === null) {
            localStorage.setItem(key, productId + ":1");
        } else {
            if (this.isProductInBag(localStorage.getItem(key),productId) === 0) {
                localStorage.setItem(key, localStorage.getItem(key) + "," + productId + ":1");
            }
        }
        console.log("local storage", localStorage.getItem(key))


        document.getElementById("ButtonDiv").innerHTML = " <a href=\"bag.html\">\n" + "<button class=\"ui primary button\" id=\"buttonToBag\" style='background-color: grey'>\n" + " Перейти в корзину\n" + "</button>\n" + "</a>";
        document.getElementById("ButtonDiv").setAttribute("onclick", "");
    },
    getProduct(id){
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
    },
    isProductInBag(str,newID) {
        ids = str.split('"').join('').split(',');
        for (it = 0; it < ids.length; it++) {

            prod = ids[it].split(":");
            if (prod[0] === newID) {
                console.log("already in bag!!!");
                alert("this product already in the bag");
                return 1;
            }
        }
        return 0;
    },
    makeRequest() {
        // var x = new XMLHttpRequest();
        productId = document.getElementById("choosenProduct").getAttribute("choosenProductID");
        console.log("profeuctId = ", productId)
        numProduct = 1
        let url = "/api/putInBag/" + productId + "/" + numProduct;
        let response = fetch(url, {
            method: "POST",
        });
        // x.open("POST", "/api/putInBag/" + productId + "/" + numProduct, true);
        // x.onload = function (){
        //     alert( x.responseText);
        // }
        // x.send(null);
    },
    writePHP: function () {
        productId = document.getElementById("choosenProduct").getAttribute("value");
        str = "<?php addToBag(" + productId + ");?>";
        document.getElementById("setSessionPHP").innerHTML = str;
    }
}
