const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/data');
const { invalidateStats } = require('../utils/stats');

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q } = req.query;
    let results = data;

    if (q) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (limit) {
      results = results.slice(0, parseInt(limit));
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const { name, price } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required and must be a non-empty string' });
    }
    if (price == null || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'price is required and must be a non-negative number' });
    }

    const data = await readData();
    const item = { ...req.body, id: Date.now() };
    data.push(item);
    await writeData(data);
    invalidateStats();
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
