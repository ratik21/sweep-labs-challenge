const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/data');
const { invalidateStats } = require('../utils/stats');
const { BadRequestError, NotFoundError } = require('../errors/AppError');

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { q } = req.query;
    const offset = Math.max(0, parseInt(req.query.offset) || 0);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
    let results = data;

    if (q) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    const total = results.length;
    results = results.slice(offset, offset + limit);

    res.json({ items: results, total });
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
      throw new NotFoundError('Item not found');
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
      throw new BadRequestError('name is required and must be a non-empty string');
    }
    if (price == null || typeof price !== 'number' || price < 0) {
      throw new BadRequestError('price is required and must be a non-negative number');
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
