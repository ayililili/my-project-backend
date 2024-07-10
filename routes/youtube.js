const express = require('express');
const router = express.Router();
const createError = require('http-errors');

const youtube = require('../utils/youtube');

router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q) {
      return next(createError(400, 'Keyword is required'));
    }

    const response = await youtube.search.list({
      part: 'snippet',
      q,
      maxResults: 10
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error occurred while searching YouTube:', error);
    next(createError(500, 'An error occurred while searching YouTube'));
  }
});

module.exports = router;
