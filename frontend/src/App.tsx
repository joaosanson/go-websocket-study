import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import './index.css';

interface Message {
  id: string;
  text: string;
  isSelf: boolean;
  sender?: string;
}

function App() {
  const [roomId, setRoomId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up websocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connect = (e: FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    // Connect to the Go backend using the current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setMessages([{ id: Date.now().toString(), text: `Connected to room: ${roomId}`, isSelf: false, sender: 'System' }]);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          text: event.data,
          isSelf: false,
          sender: 'Someone', // Can be updated if backend sends JSON with user info
        },
      ]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: 'Disconnected from server', isSelf: false, sender: 'System' },
      ]);
      wsRef.current = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Send raw text to backend
    wsRef.current.send(inputValue);

    // Optimistically add to UI
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        text: inputValue,
        isSelf: true,
      },
    ]);
    setInputValue('');
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  if (!isConnected) {
    return (
      <div className="glass-panel" style={{ height: 'auto', padding: '1rem' }}>
        <div className="connect-container">
          <h1>Join a Room</h1>
          <p>Enter a room ID to connect and start chatting.</p>
          <form className="input-form" onSubmit={connect} style={{ width: '100%' }}>
            <input
              type="text"
              placeholder="e.g., general"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={!roomId.trim()}>
              Connect
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <header className="chat-header">
        <h2>Room: {roomId}</h2>
        <div className="status-indicator">
          <div className="status-dot connected"></div>
          Connected
          <button 
            onClick={disconnect}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginLeft: '1rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
          >
            Leave
          </button>
        </div>
      </header>

      <div className="messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.isSelf ? 'self' : 'other'}`}>
            {!msg.isSelf && msg.sender && <div className="message-sender">{msg.sender}</div>}
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <form className="input-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!inputValue.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
