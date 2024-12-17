package main

import (
    "log"
    "net/http"
    "encoding/json"
    "strconv"
    "strings"
)

const pageSize = 5

type Product struct {
    Id   int    `json:"id"`
    Title string `json:"title"`
}

type RespData struct {
    Items []Product `json:"items"`
    Pages int       `json:"pages"`
}

func createProductsStore() []Product {
  var data []Product

  for i := 0; i < 20; i++ {
    idx := i + 1
    product := Product{idx, "light bulb " + strconv.Itoa(idx)}
    data = append(data, product)
  }

  return data
}

func filterItemsByTitle(products []Product, title string) []Product {
  filtered := []Product{}

  for _, value := range products {
    if strings.Contains(value.Title, title) {
      filtered = append(filtered, value)
    }
  }

  return filtered
}

func getItemsPage(products []Product, page int) []Product {
  low := (page - 1) * pageSize
  high := page * pageSize

  if len(products) < low {
    return make([]Product, 0)
  }

  if (len(products) < high) {
    high = len(products)
  }

  return products[low:high]
}

func getProducts(w http.ResponseWriter, r *http.Request) {
    data := createProductsStore()

    params := r.URL.Query()

    filter := params.Get("title")
    if (filter != "") {
      data = filterItemsByTitle(data, filter)
    }

    page,_ := strconv.Atoi(params.Get("page"))
    if page == 0 {
      page = 1
    }

    pageData := getItemsPage(data, page)

    respData := RespData{pageData, len(data) / pageSize }

    jsdata, err := json.Marshal(respData)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(jsdata)
}

func main() {
    http.HandleFunc("/", getProducts)
    log.Fatal(http.ListenAndServe(":8080", nil))
}
