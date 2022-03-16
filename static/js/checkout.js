class Order {
    constructor() {

    }
}

let makeWords = {
    positionsInOrder(num) {
        numInt = Number(num);
        if (numInt >= 5 && numInt <= 20) {
            return num + ' позиций'
        } else if (numInt % 10 === 1) {
            return num + ' позиция'
        } else if (numInt % 10 >= 2 && numInt % 10 <= 4) {
            return num + ' позиции'
        } else {
            return num + ' позиций'
        }
    }, tovarsInOrder(num) {
        numInt = Number(num);
        if (numInt >= 5 && numInt <= 20) {
            return num + ' товаров'
        } else if (numInt % 10 === 1) {
            return num + ' товар'
        } else if (numInt % 10 >= 2 && numInt % 10 <= 4) {
            return num + ' товара'
        } else {
            return num + ' товаров'
        }
    }
}


var checkout = {
    wayToGet: 0, // 0 - pickUp, 1 - delivery
    payType: -1, // 0 - upon receipt, 1 - bank Card, 2 - quickPay system
    payTypeStr: "",
    checkForm: 0, // 0 - email, 1 - SMS
    price: 0,
    phoneNumber: "",
    billPhoneNumber: "",

    printWaitToGet(way) {
        if (way === 0) {
            this.wayToGet = 0;
            document.getElementById("choosePickup").style = "border: 2px solid #0d71bb"
            document.getElementById("chooseDelivery").style = ""
            document.getElementById("wayToGetForm").innerHTML = "   <div class=\"pickup\">\n" + "                        <p>Пожалуйста, выберите пункт самовывоза.</p>\n" + "                        <div class=\"chooseStore\">\n" + "                            Выбрать пункт самовывоза\n" + "                        </div>\n" + "                    </div>"
        } else {
            this.wayToGet = 1;
            document.getElementById("choosePickup").style = ""
            document.getElementById("chooseDelivery").style = "border: 2px solid #0d71bb"
            document.getElementById("wayToGetForm").innerHTML = " <div class=\"delivery\">\n" + "                        <form class=\"ui form\">\n" + "                            <div class=\"field\">\n" + "                                <div class=\"two fields\">\n" + "                                    <div class=\"field\">\n" + "                                        <label>Город</label>\n" + "                                        <input type=\"text\" id=\"cityInput\" name=\"shipping[city]\" placeholder=\"Москва\" required minlength=\"1\">\n" + "                                        <span class=\"error\" aria-live=\"polite\"></span>\n" + "                                    </div>\n" + "                                    <div class=\"field\">\n" + "                                        <label>Улица</label>\n" + "                                        <input type=\"text\" id=\"streetInput\" name=\"shipping[street]\" placeholder=\"ул. Арбат\" required minlength=\"1\">\n" + "                                        <span class=\"error\" aria-live=\"polite\"></span>\n" + "                                    </div>\n" + "                                </div>\n" + "                            </div>\n" + "                            <div class=\"field\">\n" + "                                <div class=\"three fields\">\n" + "                                    <div class=\"field\">\n" + "                                        <label>Дом</label>\n" + "                                        <input type=\"text\" id=\"houseInput\" name=\"shipping[house]\" required minlength=\"1\">\n" + "                                        <span class=\"error\" aria-live=\"polite\"></span>\n" + "                                    </div>\n" + "                                    <div class=\"field\">\n" + "                                        <label>Строение</label>\n" + "                                        <input type=\"text\" name=\"shipping[building]\">\n" + "                                    </div>\n" + "                                    <div class=\"field\">\n" + "                                        <label>Корпус</label>\n" + "                                        <input type=\"text\" name=\"shipping[corpus]\">\n" + "                                    </div>\n" + "                                </div>\n" + "                            </div>\n" + "                            <div class=\"field\">\n" + "                                <div class=\"three fields\">\n" + "                                    <div class=\"field\">\n" + "                                        <label>Подъезд</label>\n" + "                                        <input type=\"text\" name=\"shipping[entrance]\">\n" + "                                    </div>\n" + "                                    <div class=\"field\">\n" + "                                        <label>Этаж</label>\n" + "                                        <input type=\"text\" name=\"shipping[floor]\">\n" + "                                    </div>\n" + "                                    <div class=\"field\">\n" + "                                        <label>Квартира</label>\n" + "                                        <input type=\"text\" name=\"shipping[apartment]\">\n" + "                                    </div>\n" + "                                </div>\n" + "                            </div>\n" + "                        </form>\n" + "                    </div>";
            validation.validateNoEmpty('cityInput');
            validation.validateNoEmpty('streetInput');
            validation.validateNoEmpty('houseInput');
        }
    },

    printConfirmBorder(that) {
        document.getElementById("payType1").style = "";
        document.getElementById("payType2").style = "";
        document.getElementById("payType3").style = "";
        this.payType = that.value
        this.payTypeStr = that.getAttribute("valueStr")
        that.style = "color:black; border: 2px solid #0d71bb;"
    },

    pickSendCheckTo(that, k) {
        if (!k) {
            this.checkForm = 0;
            document.getElementById("divFormSendTo").innerHTML = " <h2>Email</h2>\n" + "                                <div class=\"ui input\">\n" + "                                    <input type=\"email\" id=\"mail\" name=\"shipping[billEmail]\" required minlength=\"8\" placeholder=\"Введите ваш e-mail\">\n" + "                                    <span class=\"error\" aria-live=\"polite\"></span>\n" + "                                </div>";
            validation.validateEmail();
        } else {
            this.checkForm = 1;
            document.getElementById("divFormSendTo").innerHTML = " <h2>Телефон</h2>\n" + "                                <div class=\"ui input\">\n" + "                                    <input type=\"text\" id='billPhoneInput'" + "aria-invalid=\"false\" aria-required=\"true\"\n" + "                                           size=\"40\" required minlength=\"11\" required maxlength=\"20\"\n" + "                                           name=\"shipping[billPhone]\" placeholder=\"8 (960) 321 12-12\"\n" + "                                            pattern=\"([\\+]*[7-8]{1}\\s?[ ]*[\\(]*9[0-9]{2}[\\)]*[ ]*\\s?\\d{3}[ ]*\\d{2}[-]*\\d{2})\">\n" + "                                    <span class=\"error\" aria-live=\"polite\"></span>";
            validation.validatePhone('billPhoneInput');
            formatInputs.formatPhone('bill');
        }
        document.getElementById("sendToEmail").style = "";
        document.getElementById("sendToSMS").style = "";
        that.style = "color:black; border: 2px solid #0d71bb;"
    },

    async printAllOnload() {
        products = localStorage.getItem("productsInBag");

        products = localStorage.getItem("productsInBag").split('"').join('').split(',');
        console.log("local storage", localStorage.getItem("productsInBag"));

        document.getElementById("aboutOder").innerHTML = " <h5><a id=\"positionsInOrder\"></a> в заказе</h5>";

        positionsInOrder = makeWords.positionsInOrder(products.length)

        document.getElementById("positionsInOrder").innerHTML = positionsInOrder;
        document.getElementById("totalNumProducts").innerHTML = makeWords.tovarsInOrder(products.length)

        allPrice = 0;

        for (i = 0; i < products.length; i++) {

            product = products[i].split(":")

            productId = product[0]
            numProduct = product[1]
            nameId = "product" + (i + 1)


            productStruct = await this.getProduct(productId)

            allPrice += Number(productStruct.price) * numProduct;

            document.getElementById("aboutOder").innerHTML += " <li>\n" + "                                        <h4>" + productStruct.name + "</h4>\n" + "                                        <h6><a>" + productStruct.price * numProduct + "</a> руб - <a>" + numProduct + "</a>шт.</h6>\n" + "                                    </li>"

            console.log("prodStruct = ", productStruct)
        }

        document.getElementById("aboutOder").innerHTML += " <h2>Итого <a>" + allPrice + "</a> руб.</h2>"
        document.getElementById("totalSum").innerHTML = allPrice + ' руб';
        this.price = allPrice;

    },

    makeOrderForm() {
        var formKeys = ["firstname", "lastname", "phone", "billEmail", "billPhone", "city", "street", "house", "building", "corpus", "entrance", "floor", "apartment"];

        var orderObj = new Object();

        for (var i = 0; i < formKeys.length; i++) {
            if (document.getElementsByName("shipping[" + formKeys[i] + "]")[0] !== undefined) {

                var val = document.getElementsByName("shipping[" + formKeys[i] + "]")[0].value;

                if (val !== "" && val !== undefined) {
                    orderObj[formKeys[i]] = val;
                }
            }
        }
        orderObj["productsId"] = window.localStorage.getItem("productsInBag")
        orderObj["description"] = document.getElementById("commentForOrder").value
        orderObj["payType"] = this.payTypeStr
        orderObj["price"] = this.price
        orderObj["wayToGet"] = this.wayToGet
        orderObj["phone"] = this.phoneNumber
        orderObj["status"] = "принят"


        return orderObj;
    },


    sendOrderObj() {
        if (!validation.checkFormValid()) {
            return;
        }
        console.log('form for order is ok!')
        let url = "/api/order";
        let body = this.makeOrderForm();
        console.log("body = ", body);
        let response = fetch(url, {
            method: "POST", body: JSON.stringify(body),
        });
        return response
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
    },


}

var validation = {


    loadValidations() {
        this.validateEmail();
        this.validatePhone('phoneInput');
        this.validateNoEmpty('firstnameInput');
        this.validateNoEmpty('lastnameInput');

    },

    checkInputValid(inputId) {
        let input = document.getElementById(inputId);
        return input.validity.valid;
    },

    showErrorInput(inputId) {
        const input = document.getElementById(inputId);
        const emailError = document.querySelector('#' + inputId + ' + span.error');
        if (input.validity.valueMissing) {
            // Если поле пустое,
            // отображаем следующее сообщение об ошибке
            emailError.textContent = 'Обязательное поле';
        } else if (input.validity.tooShort) {
            emailError.textContent = `field should be at least ${input.minLength} characters; you entered ${input.value.length}.`;
        }
        emailError.className = 'error active';
    },

    showEnterField(inputId, inputName) {
        alert('заполните поле ' + inputName);
        document.getElementById(inputId).scrollIntoView({block: "center", behavior: "smooth"});
        this.showErrorInput(inputId);
        return false;
    },

    checkFormValid() {
        let inputsId = ['firstnameInput', 'lastnameInput', 'phoneInput', 'cityInput', 'streetInput', 'houseInput']
        let inputsName = ['имя', 'фамилия', 'телефон', 'город', 'улица', 'дом', '', ' ']
        for (let i = 0; i < 3; i++) {
            if (!validation.checkInputValid(inputsId[i])) {
                return this.showEnterField(inputsId[i], inputsName[i]);
            }
        }
        if (checkout.wayToGet) {
            for (let i = 3; i < 6; i++) {
                if (!validation.checkInputValid(inputsId[i])) {
                    return this.showEnterField(inputsId[i], inputsName[i]);
                }
            }
        }

        if (checkout.payType === -1) {
            alert('выберите способ оплаты');
            document.getElementById("payTypes").scrollIntoView({block: "center", behavior: "smooth"});
            return false;
        }

        if (!document.getElementById("checkboxInput").checked) {
            alert('подтвердите данные получателя');
            document.getElementById("checkboxInput").scrollIntoView({block: "center", behavior: "smooth"});
            return false;
        }

        if (checkout.checkForm) {
            if (!validation.checkInputValid('billPhoneInput')) {
                alert('заполните телефон для получения чека ');
                this.showErrorInput('billPhoneInput');
                return false;
            }
        } else {
            if (!validation.checkInputValid('mail')) {
                alert('заполните поле e-mail для получения чека');
                this.showErrorInput('mail');
                return false;
            }
        }
    },

    validateNoEmpty(inputId) {
        const form = document.getElementsByTagName('form')[0];

        const input = document.getElementById(inputId);
        const emailError = document.querySelector('#' + inputId + ' + span.error');

        input.addEventListener('input', function (event) {
            if (input.validity.valid) {
                emailError.textContent = ''; // Сбросить содержимое сообщения
                emailError.className = 'error'; // Сбросить визуальное состояние сообщения
            } else {
                showError();
            }
        });

        form.addEventListener('submit', function (event) {
            if (!input.validity.valid) {
                // Если поле email не валидно, отображаем соответствующее сообщение об ошибке
                showError();
                // Затем предотвращаем стандартное событие отправки формы
                event.preventDefault();
            }
        });

        function showError() {
            if (input.validity.valueMissing) {
                // Если поле пустое,
                // отображаем следующее сообщение об ошибке
                emailError.textContent = 'Обязательное поле';
            } else if (input.validity.tooShort) {
                emailError.textContent = `field should be at least ${input.minLength} characters; you entered ${input.value.length}.`;
            }

            // Задаём соответствующую стилизацию
            emailError.className = 'error active';
        }
    },

    validateEmail() {
        const form = document.getElementsByTagName('form')[0];

        const email = document.getElementById('mail');
        const emailError = document.querySelector('#mail + span.error');

        email.addEventListener('input', function (event) {
            // Каждый раз, когда пользователь что-то вводит,
            // мы проверяем, являются ли поля формы валидными

            if (email.validity.valid) {
                // Если на момент валидации какое-то сообщение об ошибке уже отображается,
                // если поле валидно, удаляем сообщение
                emailError.textContent = ''; // Сбросить содержимое сообщения
                emailError.className = 'error'; // Сбросить визуальное состояние сообщения
            } else {
                // Если поле не валидно, показываем правильную ошибку
                showError();
            }
        });

        form.addEventListener('submit', function (event) {
            // Если поле email валдно, позволяем форме отправляться

            if (!email.validity.valid) {
                // Если поле email не валидно, отображаем соответствующее сообщение об ошибке
                showError();
                // Затем предотвращаем стандартное событие отправки формы
                event.preventDefault();
            }
        });

        function showError() {
            if (email.validity.valueMissing) {
                // Если поле пустое,
                // отображаем следующее сообщение об ошибке
                emailError.textContent = 'You need to enter an e-mail address.';
            } else if (email.validity.typeMismatch) {
                // Если поле содержит не email-адрес,
                // отображаем следующее сообщение об ошибке
                emailError.textContent = 'Entered value needs to be an e-mail address.';
            } else if (email.validity.tooShort) {
                // Если содержимое слишком короткое,
                // отображаем следующее сообщение об ошибке
                emailError.textContent = `Email should be at least ${email.minLength} characters; you entered ${email.value.length}.`;
            }

            // Задаём соответствующую стилизацию
            emailError.className = 'error active';
        }
    },

    validatePhone(inputId) {
        const form = document.getElementsByTagName('form')[0];

        const input = document.getElementById(inputId);
        const emailError = document.querySelector('#' + inputId + ' + span.error');

        input.addEventListener('input', function (event) {
            // Каждый раз, когда пользователь что-то вводит,
            // мы проверяем, являются ли поля формы валидными

            if (input.validity.valid) {
                // Если на момент валидации какое-то сообщение об ошибке уже отображается,
                // если поле валидно, удаляем сообщение
                emailError.textContent = ''; // Сбросить содержимое сообщения
                emailError.className = 'error'; // Сбросить визуальное состояние сообщения
            } else {
                // Если поле не валидно, показываем правильную ошибку
                showError();
            }
        });

        form.addEventListener('submit', function (event) {
            // Если поле email валдно, позволяем форме отправляться

            if (!input.validity.valid) {
                // Если поле email не валидно, отображаем соответствующее сообщение об ошибке
                showError();
                // Затем предотвращаем стандартное событие отправки формы
                event.preventDefault();
            }
        });

        function showError() {
            if (input.validity.valueMissing) {
                // Если поле пустое,
                // отображаем следующее сообщение об ошибке
                emailError.textContent = 'You need to enter an  phone number.';
            } else if (input.validity.patternMismatch) {
                // Если поле содержит не email-адрес,
                // отображаем следующее сообщение об ошибке
                emailError.textContent = 'Entered value needs to be an phone number.';
            } else if (input.validity.tooShort) {
                // Если содержимое слишком короткое,
                // отображаем следующее сообщение об ошибке
                emailError.textContent = `Phone should be at least ${input.minLength} characters; you entered ${input.value.length}.`;
            }

            // Задаём соответствующую стилизацию
            emailError.className = 'error active';
        }
    }
}


var formatInputs = {
    formatPhone(bill) {
        var cc = document.getElementById("phoneInput"), events = ['input', 'change', 'blur', 'keyup'];
        var billPhone = document.getElementById("billPhoneInput");
        for (var i in events) {
            if (bill) {
                billPhone.addEventListener(events[i], checkFormatPhone.bind(billPhone, "bill"), false)
            } else {
                cc.addEventListener(events[i], checkFormatPhone, false);
            }
        }

        function checkFormatPhone(inputName) {
            var str = this.value
            var match = str.match(/^([\+]*[0-9]{1})\-?[\ ]*[\(]*([0-9]{3})\-?[\)]*[\ ]*([0-9]{3})\-?[\ ]*([0-9]{2})[\-]*([0-9]{2})/i);
            if (match) {
                this.value = [match[1], ' (', match[2], ') ', match[3], ' ', match[4], "-", match[5]].join('');
                if (inputName === "bill") {
                    checkout.billPhoneNumber = this.value
                } else {
                    checkout.phoneNumber = this.value;
                }
                return [match[1], '(', match[2], ') ', match[3], '-', match[4]].join('');
            }
        }
    },
}