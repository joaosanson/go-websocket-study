package chat

type Hub struct {
	rooms      map[string]map[*Client]bool
	broadcast  chan Message
	register   chan *Subscription
	unregister chan *Subscription
}

type Message struct {
	data   []byte
	roomID string
	sender *Client
}

type Subscription struct {
	client *Client
	roomID string
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		broadcast:  make(chan Message),
		register:   make(chan *Subscription),
		unregister: make(chan *Subscription),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case room := <-h.register:
			if _, ok := h.rooms[room.roomID]; !ok {
				h.rooms[room.roomID] = make(map[*Client]bool)
			}
			h.rooms[room.roomID][room.client] = true
		case room := <-h.unregister:
			if _, ok := h.rooms[room.roomID]; ok {
				delete(h.rooms, room.roomID)
				close(room.client.send)
			}
		case message := <-h.broadcast:
			if clients, ok := h.rooms[message.roomID]; ok {
				for client := range clients {
					if client == message.sender {
						continue
					}
					select {
					case client.send <- message.data:

					default:
						close(client.send)
						delete(clients, client)
					}
				}
			}
		}
	}
}
