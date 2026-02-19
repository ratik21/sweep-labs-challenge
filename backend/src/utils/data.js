const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readData() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.promises.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData, DATA_PATH };
