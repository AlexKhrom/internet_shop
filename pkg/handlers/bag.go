package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"net/http"
	"strings"
	"time"
)

type BagHandlers struct {
}

// cookie products:
// [{
//	 productId:1, // id of product in database
//	 numProducts:2, // num of product with productId in bag
// }]

func isElemInSlice(sl []string, elem string) bool {
	for _, word := range sl {
		if word == elem {
			return true
		}
	}
	return false
}

func (h *BagHandlers) AddToBag(w http.ResponseWriter, r *http.Request) {

	fmt.Println("hi bag handler start")

	vars := mux.Vars(r)
	productID, err := vars["PRODUCT_ID"]
	fmt.Println("productID =", productID)
	//fmt.Println(len(category))
	if !err {
		http.Error(w, `Bad id`, http.StatusBadRequest)
		return
	}

	numProduct, err2 := vars["NUM_PRODUCT"]
	fmt.Println("NUM_PRODUCT =", numProduct)
	//fmt.Println(len(category))
	if !err2 {
		http.Error(w, `Bad id`, http.StatusBadRequest)
		return
	}

	productsCookie, err1 := r.Cookie("productsInBag")

	var cookieValue string

	if productsCookie == nil {
		cookieValue = productID + ":" + numProduct
	} else {
		cookieValue = productsCookie.Value

		IdInCookie := strings.Split(productsCookie.Value, ",")

		isIdInCookie := false
		for _, it := range IdInCookie { // it = [productid:numOfProduct]
			propertyProduct := strings.Split(it, ":")
			if propertyProduct[0] == productID {
				isIdInCookie = true
			}
		}

		if !isIdInCookie {
			cookieValue += "," + productID + ":" + numProduct
		}

		//if !isElemInSlice(IdInCookie,productID){
		//	cookieValue += "," + productID
		//}

	}

	expiration := time.Now().Add(time.Hour)
	cookie := http.Cookie{
		Name:     "productsInBag",
		Value:    cookieValue,
		Expires:  expiration,
		Path:     "/",
		Domain:   "localhost",
		Secure:   false,
		HttpOnly: false,
	}
	http.SetCookie(w, &cookie)

	if err1 != nil {
		fmt.Println("some bad in set Cookie :", err1)
	}

	fmt.Println("mycookie = ", productsCookie)
	//fmt.Println(myCookie.Name)

	fmt.Println("end bag handlers")

	//body, err3 := ioutil.ReadAll(r.Body)
	//if err3 != nil{
	//	JSONError(w, http.StatusBadRequest, "can't read request body")
	//}
	//fd := &LoginForm{}

	//err := json.Unmarshal(body, fd)
	//if err != nil {
	//	JSONError(w, http.StatusBadRequest, "cant unpack payload")
	//	return
	//}

	//user, err1 := h.Repo.GetUserByLogin(fd.Login)
	//if !err1 || fd.Password != user.Password {
	//	JSONError(w, http.StatusUnauthorized, "bad login or password")
	//	fmt.Println("bad login or password")
	//	return
	//}

	//token := user.NewUserToken(fd.Login)
	//
	//resp, err := user.MakeUserTokenResp(w, token)
	//if err != nil {
	//	return
	//}
	//
	//fmt.Println(token)
	//fmt.Println(string(resp))
	//
	//_, err2 := w.Write(resp)
	//if err2 != nil {
	//	JSONError(w,http.StatusBadRequest,"bad write response")
	//}
}

func (h *BagHandlers) GiveImageURL(w http.ResponseWriter, r *http.Request) { // give to js image url
	fmt.Println("hi GiveImageURL handler")

	vars := mux.Vars(r)
	productID, err := vars["PRODUCT_ID"]
	fmt.Println("productID =", productID)
	//fmt.Println(len(category))
	if !err {
		http.Error(w, `Bad id`, http.StatusBadRequest)
		return
	}

}

//func (h *BagHandlers) GiveJSProductsID(w http.ResponseWriter, r *http.Request) {
//	fmt.Println("hi givesID handler")
//}

func JSONError(w io.Writer, status int, msg string) {
	resp, err := json.Marshal(map[string]interface{}{
		"status": status,
		"error":  msg,
	})
	if err != nil {
		fmt.Println("error in JSONError ")
		return
	}
	_, err2 := w.Write(resp)
	if err2 != nil {
		fmt.Println("some bad in JSONError write response")
	}
}
