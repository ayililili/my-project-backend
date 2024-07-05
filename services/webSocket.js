const WebSocket = require('ws');

const createWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });
  
  const clients = new Map();

  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      const message = JSON.parse(msg);

      if (message.type === 'register') {
        const { userId } = message;
        ws.userId = userId;
        clients.set(userId, ws);
        console.log(`${userId} registered`);
      }
      
      else if (message.type === 'message') {
        const { userId, recipientId, content } = message;
        
        const recipientSocket = clients.get(recipientId);
        if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
          recipientSocket.send(JSON.stringify({ userId, content }));
        }
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`${ws.userId} disconnected`);
      }
    });
  });

  return wss;
}

module.exports = createWebSocketServer;