package chat

type Type string

const (
	DirectType Type = "direct"
	GroupType  Type = "group"
)

func (t Type) Valid() bool {
	switch t {
	case DirectType, GroupType:
		return true
	default:
		return false
	}
}

type Rooms struct {
	ID        string  `json:"id"`
	Type      Type    `json:"type"`
	Name      *string `json:"name"`
	CreatedAt string  `json:"createdAt"`
}
