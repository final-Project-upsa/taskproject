// New file: websocketManager.js
class WebSocketManager {
    constructor(currentUser, onMessageReceived) {
      this.sockets = new Map();
      this.currentUser = currentUser;
      this.onMessageReceived = onMessageReceived;
    }
  
    connectToChat(chatId) {
      if (!this.sockets.has(chatId)) {
        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/`);
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.onMessageReceived(chatId, data);
        };
  
        this.sockets.set(chatId, ws);
      }
    }
  
    disconnectFromChat(chatId) {
      const ws = this.sockets.get(chatId);
      if (ws) {
        ws.close();
        this.sockets.delete(chatId);
      }
    }
  
    sendMessage(chatId, message) {
      const ws = this.sockets.get(chatId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  
    disconnectAll() {
      this.sockets.forEach((ws, chatId) => {
        this.disconnectFromChat(chatId);
      });
    }
  }
  
  export default WebSocketManager;