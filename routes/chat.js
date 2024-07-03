const express = require('express');
const router = express.Router();
var WebSocket = require('ws');

let wss;

router.post('/broadcast', (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
  
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ message }));
      }
    });
  
    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during broadcasting' });
  }
});

function initializeWebSocket(server) {
  wss = server;
}

module.exports = { router, initializeWebSocket };