package items

import (
	"database/sql"
	"fmt"
	"strconv"
	"sync"
)

type Product struct {
	ID    int    `json:"id"`
	Price int    `json:"price"`
	Name  string `json:"name"`
	URL   string `json:"url"`
}

type ProductRepoInterface interface {
	GetProductById(id int) (Product, bool)
}

type ProductRepo struct {
	Products map[int]Product
	DB       *sql.DB
	Mut      sync.Mutex
}

var (
	ExampleTokenSecret = []byte("супер секретный ключ")
)

func NewProductRepo(db *sql.DB) *ProductRepo {
	repo := new(ProductRepo)
	repo.DB = db

	return repo
}

func (r *ProductRepo) GetProductById(id int) (Product, bool) { // (product,err)
	//prod, err := r.Products[id]

	//r.Mut.Lock()
	rows, err := r.DB.Query("SELECT id,price,name,url FROM products where id=" + strconv.Itoa(id))
	if err != nil {
		fmt.Println("find product error = ", err)
		return Product{}, false
	}
	for rows.Next() {
		prod := Product{}
		err = rows.Scan(&prod.ID, &prod.Price, &prod.Name, &prod.URL)
		if err != nil {
			fmt.Println("find user error = ", err)
			return Product{}, false
		}
		rows.Close()
		return prod, true
	}

	return Product{}, false

}
