const express = require('express');
const router = express.Router();
const WebSocket = require('ws');
const authenticateJWT = require('./middlewares/authenticateJWT');
const User = require('../db/modules/User');

let wss;

router.post('/broadcast', (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ message }));
      }
    });
  
    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during broadcasting' });
  }
});

router.post('/message', authenticateJWT, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient is required' });
    }

    const message = {
      userId: req.id,
      recipientId,
      content
    }

    wss.clients.forEach(client => {

    })
  } catch (error) {
    
  }
})

router.post('/register', authenticateJWT, (req, res) => {
  
  wss.clients.forEach(c => {
    console.log(c._socket.remoteAddress);
  })
})

function initializeWebSocket(server) {
  wss = server;
}

module.exports = { router, initializeWebSocket };