package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"shop/pkg/items"
)

type OrdersHand struct {
	Repo items.OrdersRepoInterface
}

func NewOrdersHand(db *sql.DB) *OrdersHand {
	orders := new(OrdersHand)
	orders.Repo = items.NewOrderRepo(db)
	return orders
}

func (h *OrdersHand) NewOrder(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hi newOrder handler")

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		JSONError(w, http.StatusBadRequest, "can't read request body")
		return
	}
	fd := &items.Order{}

	err = json.Unmarshal(body, fd)

	if err != nil {
		fmt.Println("hi5, err = ", err)
		JSONError(w, http.StatusBadRequest, "cant unpack payload")
		return
	}

	fmt.Println("order = ", *fd)

	h.Repo.NewOrder(fd)

	//
	//rows, err := db.Query("SELECT * FROM users")
	////fmt.Println(rows.Columns())
	//for rows.Next() {
	//	var id, login, password, refresh string
	//	err = rows.Scan(&id, &login, &password, &refresh)
	//	fmt.Println("id = ", id, "; login = ", login, "; password = ", password)
	//
	//}
	//// надо закрывать соединение, иначе будет течь
	//rows.Close()
}

func (h *OrdersHand) GetOrder(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hi get order")
	orders := h.Repo.GetOrders()
	fmt.Println("orders = ", orders)

	answer, err1 := json.Marshal(orders)

	if err1 != nil {
		http.Error(w, `Bad marshal orders`, http.StatusBadRequest)
		return
	}

	w.Write(answer)
}

func (h *OrdersHand) ChangeOrderStatus(w http.ResponseWriter, r *http.Request) {

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		JSONError(w, http.StatusBadRequest, "can't read request body")
		return
	}

	fd := &items.Order{}

	err = json.Unmarshal(body, fd)

	if err != nil {
		fmt.Println(" err = ", err)
		JSONError(w, http.StatusBadRequest, "cant unpack payload")
		return
	}

	ok := h.Repo.ChangeOrderStatus(fd)
	if !ok {
		JSONError(w, http.StatusBadRequest, "bad change status")
		return
	}

}

func (h *OrdersHand) DeleteOrder(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hi delete Order")

	vars := mux.Vars(r)
	orderID, err := vars["ORDER_ID"]
	fmt.Println("orderId =", orderID)
	//fmt.Println(len(category))
	if !err {
		http.Error(w, `Bad id`, http.StatusBadRequest)
		return
	}
	ok := h.Repo.DeleteOrder(orderID)

	if !ok {
		JSONError(w, http.StatusBadRequest, "bad delete order")
		return
	}
}

func (h *OrdersHand) GetOrders(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hi get orders")

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		JSONError(w, http.StatusBadRequest, "can't read request body")
		return
	}

	fd := &items.OrderSearchForm{}

	err = json.Unmarshal(body, fd)
	fmt.Println(string(body))

	if err != nil {
		fmt.Println("hi5, err = ", err)
		JSONError(w, http.StatusBadRequest, "cant unpack payload")
		return
	}

	fmt.Println(*fd)

	sqlReq := fd.MakeOrsdersSqlRequest()

	fmt.Println("sqlreq = ", sqlReq)

	orders := h.Repo.GetOrdersForm(sqlReq)

	answer, err1 := json.Marshal(orders)

	if err1 != nil {
		http.Error(w, `Bad marshal orders`, http.StatusBadRequest)
		return
	}

	fmt.Println("orders = ", orders)

	w.Write(answer)

}
