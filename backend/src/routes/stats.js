const express = require('express');
const router = express.Router();
const { readData } = require('../utils/data');
const { mean } = require('../utils/stats');

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const items = await readData();

    const stats = {
      total: items.length,
      averagePrice: items.length === 0 ? 0 : mean(items.map(i => i.price)),
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
