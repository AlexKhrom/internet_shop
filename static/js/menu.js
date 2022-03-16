menu = {
    printNumOfProducts() {
        if (this.calcProducts() > 0) {
            document.getElementById("numOfProducts").innerHTML = "(" + this.calcProducts() + ")";
        }else{
            document.getElementById("numOfProducts").innerHTML = "";
        }
    },
    calcProducts() {
        productsId = localStorage.getItem("productsInBag");
        if (productsId === null)
            return 0
        productsId = productsId.split('"').join('').split(',')
        return productsId.length
    },
    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
}