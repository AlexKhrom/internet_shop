package middleware

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"net/http"
	"shop/pkg/items"
	"strings"
)

var (
	answerCode = 302
	noAuthUrls = map[string]string{
		"/api/posts": "POST",
		"/api/post/": "DELETE_POST",
		"/upvote":    "GET",
		"/downvote":  "GET",
		"/unvote":    "GET",
	}
	// noSessUrls = map[string]struct{}{
	//	"/": struct{}{},
	// }
)

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//next.ServeHTTP(w, r)

		fmt.Println("\n\n\nauth middleware")
		fmt.Println("r.Method = ", r.Method)
		fmt.Println("url = ", r.URL.Path)

		rMethod, ok := noAuthUrls[r.URL.Path]

		if strings.Contains(r.URL.Path, "/static/pages/manager.html") && r.Method == "GET" ||
			strings.Contains(r.URL.Path, "/static/pages/orders.html") && r.Method == "GET" ||
			strings.Contains(r.URL.Path, "/api/order") && r.Method == "GET" {
			fmt.Println("header  = ", r.Header)

			tokenCookie, err := r.Cookie("token")
			if err != nil {
				fmt.Println("\nno cookie token")
				http.Redirect(w, r, "/static/pages/main.html", answerCode)
			}

			//здесь проверять строку из токена

			if tokenCookie == nil {
				fmt.Println("\nno auth1")
				http.Redirect(w, r, "/static/pages/main.html", answerCode)
				return
			}

			fmt.Println("cookie = ", tokenCookie.Value)

			inToken := tokenCookie.Value

			if inToken == "" {
				fmt.Println("\nno auth2")
				http.Redirect(w, r, "/static/pages/main.html", answerCode)
				return
			}

			fmt.Println("token = ", inToken)

			hashSecretGetter := func(token *jwt.Token) (interface{}, error) {
				method, ok1 := token.Method.(*jwt.SigningMethodHMAC)
				if !ok1 || method.Alg() != "HS256" {
					return nil, fmt.Errorf("bad sign method")
				}
				return items.ExampleTokenSecret, nil
			}

			token, err := jwt.Parse(inToken, hashSecretGetter)

			//
			//fmt.Println("token claims\n\n", token.Claims)
			//payload := items.GetTokenPayload(w, r)
			//fmt.Println("token valid = ", payload["exp"])
			//
			//expTime := payload["exp"].(float64)
			//
			//if expTime < float64(time.Now().Unix()) {
			//	fmt.Println("jwt is expire")
			//	http.SetCookie(w, &http.Cookie{
			//		Name:     "token",
			//		Value:    "end",
			//		Expires:  time.Now().Add(time.Second * 1),
			//		HttpOnly: false, // httponly = true + secure
			//		Path:     "/",
			//	})
			//	http.Redirect(w, r, "/static/pages/main.html", answerCode)
			//	return
			//}

			if err != nil || !token.Valid {
				fmt.Println("jwt is expire", err, "/////", token.Valid)
				//http.SetCookie(w, &http.Cookie{
				//	Name:     "token",
				//	Value:    "end",
				//	Expires:  time.Now().Add(time.Second * (-1)),
				//	HttpOnly: false, // httponly = true + secure
				//	Path:     "/",
				//})
				fmt.Println("\nno auth2")
				http.Redirect(w, r, "/static/pages/main.html", answerCode)
				return
			}

			//userID := payload["user"].(map[string]interface{})["id"]

			//timeT := time.Unix(tUnix, 0)

			_, ok = token.Claims.(jwt.MapClaims)
			if !ok {
				fmt.Println("\nno auth3")
				http.Redirect(w, r, "/static/pages/main.html", answerCode)
				return
			}
			next.ServeHTTP(w, r)
		} else if !ok || r.Method != rMethod {
			next.ServeHTTP(w, r)
			return
		}
	})
}
