package chat

import (
	"log"
	"net/http"
)

type Handler struct {
	hub *Hub
}

func NewHandler(hub *Hub) *Handler {
	return &Handler{hub: hub}
}

func (h Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	roomID := r.PathValue("roomID")
	client := &Client{hub: h.hub, conn: conn, send: make(chan []byte, 256), roomID: roomID}
	client.hub.register <- &Subscription{
		client: client,
		roomID: roomID,
	}

	go client.writePump()
	go client.readPump()
}
