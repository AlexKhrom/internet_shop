package handlers

import (
	"crypto/sha1"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"shop/pkg/items"
	"time"
)

type UserHand struct {
	Repo items.UserRepoInterface
}

type LoginForm struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

func NewUserHand(db *sql.DB) *UserHand {
	us := new(UserHand)
	us.Repo = items.NewUserRepo(db)
	return us
}

func (h *UserHand) Login(w http.ResponseWriter, r *http.Request) {

	fmt.Println("hi login")

	body, err3 := ioutil.ReadAll(r.Body)
	if err3 != nil {
		JSONError(w, http.StatusBadRequest, "can't read request body")
	}
	fd := &LoginForm{}

	err := json.Unmarshal(body, fd)
	if err != nil {
		JSONError(w, http.StatusBadRequest, "cant unpack payload")
		return
	}

	//fmt.Println("body = ", string(body))
	//fmt.Println("fd = ", *fd)
	//fmt.Println("login = ", fd.Login)
	//fmt.Println("password = ", fd.Password)

	user, err1 := h.Repo.GetUserByLogin(fd.Login)

	fmt.Println("user = ", user)

	shaPassword := h.makeSha1(fd.Login + fd.Password)

	if !err1 || shaPassword != user.Password {
		JSONError(w, http.StatusUnauthorized, "bad login or password")
		fmt.Println("bad login or password")
		return
	}

	token := user.NewUserToken(fd.Login)

	resp, err := user.MakeUserTokenResp(w, token)
	if err != nil {
		return
	}

	fmt.Println(token)
	fmt.Println(string(resp))

	tokenString, err := token.SignedString(items.ExampleTokenSecret)

	expiration := time.Now().Add(time.Hour * 24 * 30)

	cookie := http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  expiration,
		HttpOnly: false, // httponly = true + secure
		Path:     "/",
	}
	http.SetCookie(w, &cookie)

	refreshToken, err3 := user.NewRefreshToken()

	expRefresh := time.Now().Add(time.Hour * 24 * 30).Unix()
	h.Repo.SetRefreshToken(refreshToken, expRefresh, fd.Login)

	fmt.Println("refreshToken = ", refreshToken)

	cookie = http.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken,
		Expires:  time.Now().Add(time.Hour * 24 * 30),
		HttpOnly: false, // httponly = true + secure
		Path:     "/",
	}
	http.SetCookie(w, &cookie)

	//fmt.Println("cookies = ",r.Cookies())

	_, err2 := w.Write(resp)
	if err2 != nil {
		JSONError(w, http.StatusBadRequest, "bad write response")
	}

	//fmt.Println("url = ",  r.Header.Get("Referer"))
	//
	////http.Redirect(w,r,"http://localhost:8085/static/pages/manager.html", 302)
	//
	//w.Header().Set("Location","http://localhost:8085/static/pages/manager.html")
	//w.Header().Add("Set-Cookie", " path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT")
	//w.WriteHeader(303)
	//
	//fmt.Println("\nend login\n")

}

func (h *UserHand) RefreshTokens(w http.ResponseWriter, r *http.Request) {

	tokenPaylod := items.GetTokenPayload(w, r)

	if tokenPaylod == nil {
		JSONError(w, http.StatusBadRequest, "bad access token")
		return
	}

	userLogin, ok := tokenPaylod["user"].(map[string]interface{})["username"]
	if !ok {
		JSONError(w, http.StatusBadRequest, "bad access token")
		return
	}

	fmt.Println("\n\nuserID = ", userLogin)

	oldRefreshToken, err := r.Cookie("refreshToken")

	if err != nil {
		JSONError(w, http.StatusBadRequest, "bad refresg in cookie")
		return
	}
	fmt.Println("oldRefresh = ", oldRefreshToken.Value)

	user, err1 := h.Repo.GetUserByLogin(userLogin.(string))
	fmt.Println("user = ", user)
	if !err1 {
		JSONError(w, http.StatusBadRequest, "bad user in base from jwt")
		return
	}

	fmt.Println(user.RefreshToken.Token)
	fmt.Println(user.RefreshToken.Exp)

	if user.RefreshToken.Token != oldRefreshToken.Value {
		JSONError(w, http.StatusBadRequest, "bad refreshtokens are not equal")
		return
	}

	if user.RefreshToken.Exp <= time.Now().Unix() {
		JSONError(w, http.StatusBadRequest, "bad refreshtoken is expire")
		return
	}

	newTokenString, err := user.NewRefreshToken()
	if err != nil {
		JSONError(w, http.StatusBadRequest, "can't creat new refresh")
		return
	}
	//newRefreshToken := items.RefreshToken{
	//	Token: newTokenString,
	//	Exp: time.Now().Unix(),
	//}

	h.Repo.SetRefreshToken(newTokenString, user.RefreshToken.Exp, userLogin.(string))

	cookie := http.Cookie{
		Name:     "refreshToken",
		Value:    newTokenString,
		Expires:  time.Now().Add(time.Hour * 24 * 30),
		HttpOnly: false, // httponly = true + secure
		Path:     "/",
	}
	http.SetCookie(w, &cookie)

	token := user.NewUserToken(userLogin.(string))

	resp, err := user.MakeUserTokenResp(w, token)
	if err != nil {
		return
	}

	tokenString, err := token.SignedString(items.ExampleTokenSecret)

	expiration := time.Now().Add(10 * time.Hour)

	cookie = http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  expiration,
		HttpOnly: false, // httponly = true + secure
		Path:     "/",
	}
	http.SetCookie(w, &cookie)

	_, err2 := w.Write(resp)
	if err2 != nil {
		JSONError(w, http.StatusBadRequest, "bad write response")
	}

}

func (h *UserHand) SingUp(w http.ResponseWriter, r *http.Request) {

	body, err3 := ioutil.ReadAll(r.Body)
	if err3 != nil {
		JSONError(w, http.StatusBadRequest, "can't read request body")
	}
	fd := &LoginForm{}

	fmt.Println(string(body))

	err := json.Unmarshal(body, fd)
	if err != nil {
		JSONError(w, http.StatusBadRequest, "cant unpack payload")
		return
	}

	isUser := h.Repo.FindUser(fd.Login)
	if isUser {
		JSONError(w, http.StatusBadRequest, "this username is already exist")
		return
	}

	newUser := items.User{
		ID:       h.Repo.GetUsersLen() + 1,
		Fullname: fd.Login + " " + fd.Login + "ov",
		Password: fd.Password,
	}
	h.Repo.NewUser(fd.Login, newUser)

	token := newUser.NewUserToken(fd.Login)

	tokenString, err := token.SignedString(items.ExampleTokenSecret)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	resp, err1 := json.Marshal(map[string]interface{}{
		"status": http.StatusOK,
		"token":  tokenString,
	})
	if err1 != nil {
		JSONError(w, http.StatusBadRequest, "can't marshal token")
		return
	}

	_, err2 := w.Write(resp)
	if err2 != nil {
		JSONError(w, http.StatusBadRequest, "bad write response")
	}
}

func (h *UserHand) makeSha1(s string) string {
	ha := sha1.New()
	ha.Write([]byte(s))
	sha1_hash := hex.EncodeToString(ha.Sum(nil))

	fmt.Println(s, sha1_hash)
	return sha1_hash
}
