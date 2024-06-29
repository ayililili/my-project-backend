const express = require('express');
const router = express.Router();

const youtube = require('../utils/youtube');

router.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const response = await youtube.search.list({
      part: 'snippet',
      q,
      maxResults: 10
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
})

module.exports = router;