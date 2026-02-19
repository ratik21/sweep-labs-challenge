const { readData } = require('./data');

let cachedStats = null;

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function getStats() {
  if (cachedStats) return cachedStats;

  const items = await readData();

  if (items.length === 0) {
    cachedStats = { total: 0, averagePrice: 0 };
  } else {
    cachedStats = {
      total: items.length,
      averagePrice: mean(items.map(i => i.price)),
    };
  }

  return cachedStats;
}

function invalidateStats() {
  cachedStats = null;
}

module.exports = { mean, getStats, invalidateStats };
