package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"shop/pkg/items"
	"strconv"
)

type ProductHandlers struct {
}

type ProductHand struct {
	Repo items.ProductRepoInterface
}

type ProductForm struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

func NewProductHand(db *sql.DB) *ProductHand {
	prod := new(ProductHand)
	prod.Repo = items.NewProductRepo(db)
	return prod
}

func (h *ProductHand) GetProduct(w http.ResponseWriter, r *http.Request) { /// ->id  __ <-info about product

	fmt.Println("hi product handler start")

	vars := mux.Vars(r)
	productID, err := vars["PRODUCT_ID"]
	fmt.Println("productID =", productID)
	//fmt.Println(len(category))
	if !err {
		http.Error(w, `Bad id`, http.StatusBadRequest)
		return
	}

	intId, err1 := strconv.Atoi(productID)

	if err1 != nil {
		http.Error(w, `Bad id`, http.StatusBadRequest)
		return
	}

	prod, err := h.Repo.GetProductById(intId)

	fmt.Println("prod = ", prod)

	//body, err3 := ioutil.ReadAll(r.Body)
	//if err3 != nil {
	//	JSONError(w, http.StatusBadRequest, "can't read request body")
	//}

	//fd := &ProductForm{}

	answer, err1 := json.Marshal(prod)

	fmt.Println(string(answer))

	w.Write(answer)
}
