package main

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	// "github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"shop/pkg/handlers"

	"fmt"
	"go.uber.org/zap"
	"net/http"
	// "io"
	// "io/ioutil"
	// "time"
	"shop/pkg/middleware"
)

func main() {

	zapLogger, err := zap.NewProduction()
	if err != nil {
		fmt.Println("can't zap.NewProduction()")
		return
	}
	defer func() {
		err = zapLogger.Sync()
		fmt.Println("can't  zapLogger.Sync()")
	}()
	//logger := zapLogger.Sugar()

	r := mux.NewRouter()

	dsn := "root:root@tcp(localhost:8889)/internet_shop?"
	// указываем кодировку
	dsn += "&charset=utf8"
	// отказываемся от prapared statements
	// параметры подставляются сразу
	dsn += "&interpolateParams=true"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println("errpr!!!!", err)
		return
	}

	db.SetMaxOpenConns(10)

	err = db.Ping() // вот тут будет первое подключение к базе
	if err != nil {
		panic(err)
	}

	BagRepo := handlers.BagHandlers{}
	ProductRepo := handlers.NewProductHand(db)
	userRepo := handlers.NewUserHand(db)
	OrdersRepo := handlers.NewOrdersHand(db)

	r.HandleFunc("/api/putInBag/{PRODUCT_ID}/{NUM_PRODUCT}", BagRepo.AddToBag).Methods("POST")

	r.HandleFunc("/api/order", OrdersRepo.GetOrder).Methods("GET")                  // get all orders
	r.HandleFunc("/api/order", OrdersRepo.NewOrder).Methods("POST")                 // creat new order
	r.HandleFunc("/api/order", OrdersRepo.ChangeOrderStatus).Methods("PUT")         // change order-status
	r.HandleFunc("/api/order/{ORDER_ID}", OrdersRepo.DeleteOrder).Methods("DELETE") // delete order
	r.HandleFunc("/api/orders", OrdersRepo.GetOrders).Methods("POST")               // get some orders

	r.HandleFunc("/api/giveProductUrl/{PRODUCT_ID}", ProductRepo.GetProduct).Methods("POST")

	r.HandleFunc("/api/login", userRepo.Login).Methods("POST")
	r.HandleFunc("/api/refresh", userRepo.RefreshTokens).Methods("GET")

	//r.Handle("/", http.FileServer(http.FileSystem(http.Dir("static/pages/main.html"))))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(".././static"))))

	//handler := middleware.Auth(r)
	handler := middleware.Auth(r)
	//handler = middleware.AccessLog(logger, r)

	port := "8085"
	fmt.Println("start serv on port " + port)
	err = http.ListenAndServe(":"+port, handler)
	if err != nil {
		fmt.Println("can't Listen and server")
		return
	}

}
