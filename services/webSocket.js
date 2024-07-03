const WebSocket = require('ws');

const createWebSocketServer = (server) => {
  const wss = new WebSocket.Server( {server} );
  
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return wss;
}

module.exports = createWebSocketServer;