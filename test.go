package main

import "fmt"

type Client struct {
	Name string
}

type Hub struct {
	rooms map[string]map[*Client]bool
}

func main() {
	// Initialize our hub with one room, and one client in it
	client1 := &Client{Name: "Alice"}
	client2 := &Client{Name: "Bob"} // Bob exists, but won't be in the room

	hub := &Hub{
		rooms: map[string]map[*Client]bool{
			"chat-room": {
				client1: true,
			},
		},
	}

	fmt.Println("--- Testing a non-existent room ---")
	missingRoom := hub.rooms["random-room"]
	fmt.Printf("Value of missing room: %v\n", missingRoom)
	fmt.Printf("Is missing room nil? %v\n\n", missingRoom == nil)

	fmt.Println("--- Testing a non-existent client in an existing room ---")
	chatRoom := hub.rooms["chat-room"]
	isBobInRoom := chatRoom[client2]
	fmt.Printf("Is Bob in the room? %v\n\n", isBobInRoom)

	// Bonus: Go provides an optional second boolean return value to explicitly
	// check if the key was present, rather than just relying on the zero value.
	fmt.Println("--- The 'comma ok' idiom ---")
	value, exists := chatRoom[client2]
	fmt.Printf("Value returned: %v, Did the key actually exist? %v\n", value, exists)
}
