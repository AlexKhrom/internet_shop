package items

import (
	"database/sql"
	"fmt"
	"strconv"
	"sync"
)

type Order struct {
	Id          int     `json:"id"`
	Status      string  `json:"status"`
	Firstname   string  `json:"firstname"`
	Lastname    string  `json:"lastname"`
	Phone       string  `json:"phone"`
	BillEmail   string  `json:"billEmail"`
	BillPhone   string  `json:"billPhone"`
	WayToGet    int     `json:"wayToGet"` // способ доставки // 0 - самовыоз , 1 - доставка
	City        string  `json:"city"`
	Street      string  `json:"street"`
	House       string  `json:"house"`
	Building    string  `json:"building"`
	Corpus      string  `json:"corpus"`
	Entrance    string  `json:"entrance"`
	Floor       string  `json:"floor"`
	Apartment   string  `json:"apartment"`
	Price       float32 `json:"price"`
	ProductsId  string  `json:"productsId"`
	Description string  `json:"description"`
	PayType     string  `json:"payType"`
}

type OrderSearchForm struct {
	IdFrom      int     `json:"idFrom"`
	IdTo        int     `json:"idTo"`
	Status      string  `json:"status"`
	Firstname   string  `json:"firstname"`
	Lastname    string  `json:"lastname"`
	Phone       string  `json:"phone"`
	BillEmail   string  `json:"Email"`
	BillPhone   string  `json:"billPhone"`
	WayToGet    int     `json:"wayToGet"` // способ доставки // 0 - самовыоз , 1 - доставка
	City        string  `json:"city"`
	Street      string  `json:"street"`
	House       int     `json:"house"`
	Building    string  `json:"building"`
	Corpus      string  `json:"corpus"`
	Entrance    string  `json:"entrance"`
	Floor       string  `json:"floor"`
	Apartment   string  `json:"apartment"`
	PriceFrom   float32 `json:"priceFrom"`
	PriceTo     float32 `json:"priceTo"`
	ProductsId  string  `json:"productsId"`
	Description string  `json:"description"`
	PayType     string  `json:"payType"`
}

type OrdersRepoInterface interface {
	GetOrders() []Order
	GetOrdersForm(req string) []Order
	ChangeOrderStatus(order *Order) bool
	DeleteOrder(id string) bool
	NewOrder(order *Order) bool
}

type OrdersRepo struct {
	mut    sync.Mutex
	Orders map[int]Order
	DB     *sql.DB
}

func NewOrderRepo(db *sql.DB) *OrdersRepo {
	repo := new(OrdersRepo)
	repo.Orders = map[int]Order{}
	repo.DB = db
	return repo
}

func (r *OrdersRepo) NewOrder(order *Order) bool {

	result, err := r.DB.Exec(
		"INSERT INTO orders (`firstname`, `lastname`,`phone`,`billEmail`,`billPhone`,`wayToGet`,`city`,`street`,`house`,`building`,`corpus`,`entrance`,`floor`,`apartment`,`price`,`productsId`,`description`,`payType`) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		order.Firstname,
		order.Lastname,
		order.Phone,
		order.BillEmail,
		order.BillPhone,
		order.WayToGet,
		order.City,
		order.Street,
		order.House,
		order.Building,
		order.Corpus,
		order.Entrance,
		order.Floor,
		order.Apartment,
		order.Price,
		order.ProductsId,
		order.Description,
		order.PayType,
	)
	if err != nil {
		fmt.Println("err new order sql = ", err)
		return false
	}

	affected, err := result.RowsAffected()
	if err != nil {
		fmt.Println("err new order sql = ", err)
		return false

	}

	lastID, err := result.LastInsertId()
	if err != nil {
		fmt.Println("err new order sql = ", err)
		return false
	}

	fmt.Println("Insert - RowsAffected", affected, "LastInsertId: ", lastID)

	return true
}

func (r *OrdersRepo) GetOrders() []Order {

	orders := []Order{}

	rows, err := r.DB.Query("SELECT * FROM orders")
	if err != nil {
		fmt.Println("err get orders sql = ", err)
		return nil
	}
	for rows.Next() {
		order := Order{}
		err = rows.Scan(&order.Id, &order.Status, &order.Firstname, &order.Lastname, &order.Phone, &order.BillEmail, &order.BillPhone,
			&order.WayToGet, &order.City, &order.Street, &order.House, &order.Building, &order.Corpus,
			&order.Entrance, &order.Floor, &order.Apartment, &order.Price, &order.ProductsId, &order.Description,
			&order.PayType)
		if err != nil {
			fmt.Println("err get orders sql = ", err)
			return nil
		}
		fmt.Println("order = ", order)
		orders = append(orders, order)
	}
	// надо закрывать соединение, иначе будет течь
	rows.Close()

	return orders
}

func (r *OrdersRepo) GetOrdersForm(req string) []Order {
	orders := []Order{}

	rows, err := r.DB.Query(req)
	if err != nil {
		fmt.Println("err get orders sql = ", err)
		return nil
	}
	for rows.Next() {
		order := Order{}
		err = rows.Scan(&order.Id, &order.Status, &order.Firstname, &order.Lastname, &order.Phone, &order.BillEmail, &order.BillPhone,
			&order.WayToGet, &order.City, &order.Street, &order.House, &order.Building, &order.Corpus,
			&order.Entrance, &order.Floor, &order.Apartment, &order.Price, &order.ProductsId, &order.Description,
			&order.PayType)
		if err != nil {
			fmt.Println("err get orders sql = ", err)
			return nil
		}
		fmt.Println("order = ", order)
		orders = append(orders, order)
	}
	// надо закрывать соединение, иначе будет течь
	rows.Close()

	return orders
}

func (r *OrdersRepo) ChangeOrderStatus(order *Order) bool {
	_, err := r.DB.Query("UPDATE orders SET `status` = '" + order.Status + "' WHERE orders.id = " + strconv.Itoa(order.Id) + ";")
	if err != nil {
		fmt.Println("err change order status sql = ", err)
		return false
	}
	return true
}

func (r *OrdersRepo) DeleteOrder(id string) bool {
	_, err := r.DB.Query("DELETE FROM orders WHERE orders.id=" + id)
	if err != nil {
		fmt.Println("err delete order sql = ", err)
		return false
	}
	return true
}

func (ord *OrderSearchForm) MakeOrsdersSqlRequest() string {
	req := "SELECT * FROM orders WHERE "

	if ord.IdFrom != 0 {
		req += "id>=" + strconv.Itoa(ord.IdFrom) + " AND "
	}
	if ord.IdTo != 0 {
		req += "id<=" + strconv.Itoa(ord.IdTo) + " AND "
	}

	if ord.WayToGet != 0 {
		req += "wayToGet=" + string(ord.WayToGet) + " AND "
	}

	if ord.PriceFrom != 0 {
		s := fmt.Sprintf("%f", ord.PriceFrom) + " AND "
		req += "price>=" + s
	}

	if ord.PriceTo != 0 {
		s := fmt.Sprintf("%f", ord.PriceTo) + " AND "
		req += "price<=" + s
	}

	if ord.Firstname != "" {
		req += "firstname='" + ord.Firstname + "'" + " AND "
	}
	if ord.Lastname != "" {
		req += "lastname='" + ord.Lastname + "'" + " AND "
	}
	if ord.Phone != "" {
		req += "phone='" + ord.Phone + "'" + " AND "
	}
	if ord.BillEmail != "" {
		req += "billEmail='" + ord.BillEmail + "' AND "
	}
	if ord.BillPhone != "" {
		req += "billPhone='" + ord.BillPhone + "' AND "
	}
	if ord.City != "" {
		req += "city='" + ord.City + "' AND "
	}
	if ord.Street != "" {
		req += "street='" + ord.Street + "' AND "
	}
	if ord.House != 0 {
		req += "house=" + string(ord.House) + " AND "
	}
	if ord.Building != "" {
		req += "building='" + ord.Building + "' AND "
	}
	if ord.Corpus != "" {
		req += "corpus='" + ord.Corpus + "' AND "
	}
	if ord.Entrance != "" {
		req += "entrance='" + ord.Entrance + "' AND "
	}
	if ord.Apartment != "" {
		req += "apartment='" + ord.Apartment + "' AND "
	}
	if ord.ProductsId != "" {
		req += "productsId='" + ord.ProductsId + "' AND "
	}
	if ord.Description != "" {
		req += "description LIKE '%" + ord.Description + "%' AND "
	}
	if ord.PayType != "" {
		req += "payType='" + ord.PayType + "' AND "
	}

	req = checkEndStr(req)
	fmt.Println(req)
	return req
}

func checkEndStr(str string) string {
	arr := []byte(str)
	mystr := string(arr[len(arr)-4:])

	if string(arr[len(arr)-6:]) == "WHERE " {
		return string(arr[:len(arr)-6])
	}

	if mystr == "AND " {
		return string(arr[:len(arr)-4])
	} else {
		return str
	}
}
