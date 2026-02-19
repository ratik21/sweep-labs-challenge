const express = require('express');
const router = express.Router();
const { getStats } = require('../utils/stats');

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    res.json(await getStats());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
