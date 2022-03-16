package items

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"io"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type User struct {
	ID           int
	Login        string
	Fullname     string
	Password     string
	RefreshToken RefreshToken
}

type UserRepoInterface interface {
	FindUser(userLogin string) bool
	GetUserByLogin(userLogin string) (User, bool)
	NewUser(userLogin string, newUser User)
	GetUsersLen() int
	SetRefreshToken(token string, exp int64, userLogin string) bool
}

type UserRepo struct {
	Users map[string]User
	DB    *sql.DB
	Mut   sync.Mutex
}

type RefreshToken struct {
	Token string
	Exp   int64
}

func NewUserRepo(db *sql.DB) *UserRepo {
	repo := new(UserRepo)
	repo.DB = db
	//repo.Users = map[string]User{
	//	"user": {1, "User Userov", "", "d7316a3074d562269cf4302e4eed46369b523687", RefreshToken{
	//		"",
	//		0,
	//	}},
	//	"alex": {2, "Alexander Khromov", "", "731990ec145624822eee97d6bedb0a79efb28ccb", RefreshToken{
	//		"",
	//		0,
	//	}},
	//}
	return repo
}

func (repo *UserRepo) SetRefreshToken(token string, exp int64, userLogin string) bool {

	if !repo.FindUser(userLogin) {
		return true
	}

	expString := "{\"Token\":\"" + token + "\",\"Exp\":" + strconv.Itoa(int(exp)) + "}"

	_, err := repo.DB.Exec(
		"UPDATE `users` SET `refresh` = '" + expString + "' WHERE `users`.`login` = '" + userLogin + "';",
	)

	if err != nil {
		fmt.Println("setfresh error = ", err)
		return true
	}
	return false
	//_, ok := repo.Users[userLogin]
	//if !ok {
	//	return true
	//}
	//repo.Users[userLogin] = User{
	//	ID:       repo.Users[userLogin].ID,
	//	Fullname: repo.Users[userLogin].Fullname,
	//	Password: repo.Users[userLogin].Password,
	//	RefreshToken: RefreshToken{
	//		Token: token,
	//		Exp:   exp,
	//	},
	//}
	//fmt.Println("users = ", repo.Users)
	//return false
}

func (repo *UserRepo) FindUser(userLogin string) bool { // все кончено нужно делаит через id а не user-login

	rows, err := repo.DB.Query("SELECT login FROM users")
	if err != nil {
		fmt.Println("find user error = ", err)
		return false
	}
	for rows.Next() {
		var login string
		err = rows.Scan(&login)
		if err != nil {
			fmt.Println("find user error = ", err)
			return false
		}

		if login == userLogin {
			return true
		}
	}
	// надо закрывать соединение, иначе будет течь
	rows.Close()
	return false

	//for user := range repo.Users {
	//	if user == userLogin {
	//		return true
	//	}
	//}
	//return false
}

func (repo *UserRepo) GetUserByLogin(userLogin string) (User, bool) {

	rows, err := repo.DB.Query("SELECT * FROM users WHERE login ='" + userLogin + "'")
	if err != nil {
		fmt.Println("find user error = ", err)
		return User{}, false
	}

	user := User{}
	refreshStrig := ""
	refresh := RefreshToken{}

	for rows.Next() {

		err = rows.Scan(&user.ID, &user.Login, &user.Password, &refreshStrig)
		if err != nil {
			fmt.Println("find user error = ", err)
			return User{}, false
		}

		fmt.Println("resresh = ", refreshStrig)

		err = json.Unmarshal([]byte(refreshStrig), &refresh)
		if err != nil {
			fmt.Println("get user error = ", err)
			return User{}, false
		}

		user.RefreshToken = refresh

		return user, true
	}
	// надо закрывать соединение, иначе будет течь
	rows.Close()

	return User{}, false
	//user, err1 := repo.Users[userLogin]
	//return user, err1
}

func (repo *UserRepo) NewUser(userLogin string, newUser User) {
	repo.Mut.Lock()
	repo.Users[userLogin] = newUser
	repo.Mut.Unlock()
}

func (repo *UserRepo) GetUsersLen() int {
	rows, err := repo.DB.Query("SELECT id FROM users")
	if err != nil {
		fmt.Println("find user error = ", err)
		return 0
	}
	c := 0
	for rows.Next() {
		c++
	}
	return c
}

func (u User) NewUserToken(login string) *jwt.Token {

	timeNow := time.Now().Unix()
	exprTime := time.Now().Add(time.Hour * 15).Unix()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user": map[string]interface{}{
			"username": login,
			"id":       u.ID,
		},
		"iat": timeNow,
		"exp": exprTime,
	})

	return token
}

func (u User) MakeUserTokenResp(w http.ResponseWriter, token *jwt.Token) ([]byte, error) {
	tokenString, err := token.SignedString(ExampleTokenSecret)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return nil, err
	}

	resp, err := json.Marshal(map[string]interface{}{
		"status": http.StatusOK,
		"token":  tokenString,
	})

	if err != nil {
		jsonError(w, http.StatusBadRequest, "cant pack payload")
		return nil, nil
	}

	return resp, nil
}

func (u User) NewRefreshToken() (string, error) {
	b := make([]byte, 32)

	s := rand.NewSource(time.Now().Unix())
	r := rand.New(s)

	_, err := r.Read(b)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", b), nil
}

func GetTokenPayload(w http.ResponseWriter, r *http.Request) jwt.MapClaims {

	inTokenCookie, err1 := r.Cookie("token")

	if err1 != nil || inTokenCookie == nil {
		fmt.Println("bad token in cookie gettokenpayload")
		return nil
	}

	inToken := inTokenCookie.Value

	fmt.Println("token = ", inToken)

	hashSecretGetter := func(token *jwt.Token) (interface{}, error) {
		method, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok || method.Alg() != "HS256" {
			return nil, fmt.Errorf("bad sign method")
		}
		return ExampleTokenSecret, nil
	}

	token, _ := jwt.Parse(inToken, hashSecretGetter)
	//if err != nil {
	//	fmt.Println("bad token")
	//	jsonError(w, http.StatusUnauthorized, "bad token")
	//	return nil
	//}

	payload, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		jsonError(w, http.StatusUnauthorized, "no payload")
	}
	return payload
}

func jsonError(w io.Writer, status int, msg string) {
	resp, err := json.Marshal(map[string]interface{}{
		"status": status,
		"error":  msg,
	})
	if err != nil {
		fmt.Println("bad in jsonError")
		return
	}
	_, err2 := w.Write(resp)
	if err2 != nil {
		jsonError(w, http.StatusBadRequest, "bad write response")
	}
}
