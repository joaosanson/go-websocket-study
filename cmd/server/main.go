package main

import (
	"log"
	"net/http"

	"github.com/joaosanson/go-websocket-study/internal/chat"
)

func main() {
	hub := chat.NewHub()
	chatHandler := chat.NewHandler(hub)

	go hub.Run()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /ws/{roomID}", chatHandler.ServeWS)
	
	// Serve the React frontend build
	fs := http.FileServer(http.Dir("./frontend/dist"))
	mux.Handle("/", fs)

	log.Println("server is running on port :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
