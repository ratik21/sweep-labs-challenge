const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Not Found
app.use('*', notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
