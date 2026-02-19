const request = require('supertest');
const app = require('../../src/app');
const { readData, writeData } = require('../../src/utils/data');
const { invalidateStats } = require('../../src/utils/stats');

jest.mock('../../src/utils/data');
jest.mock('../../src/utils/stats');

const mockItems = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
  { id: 3, name: 'Ergonomic Chair', category: 'Furniture', price: 799 },
];

beforeEach(() => {
  jest.clearAllMocks();
  readData.mockResolvedValue([...mockItems]);
  writeData.mockResolvedValue(undefined);
  invalidateStats.mockImplementation(() => {});
});

describe('GET /api/items', () => {
  it('returns all items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].name).toBe('Laptop Pro');
  });

  it('filters by search query', async () => {
    const res = await request(app).get('/api/items?q=laptop');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Laptop Pro');
  });

  it('search is case-insensitive', async () => {
    const res = await request(app).get('/api/items?q=LAPTOP');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Laptop Pro');
  });

  it('limits results', async () => {
    const res = await request(app).get('/api/items?limit=2');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns empty array when no matches', async () => {
    const res = await request(app).get('/api/items?q=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/items/:id', () => {
  it('returns item when found', async () => {
    const res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Laptop Pro');
    expect(res.body.price).toBe(2499);
  });

  it('returns 404 when item not found', async () => {
    const res = await request(app).get('/api/items/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Item not found' });
  });
});

describe('POST /api/items', () => {
  it('creates item with valid payload', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test Item', price: 50, category: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Item');
    expect(res.body.price).toBe(50);
    expect(res.body.id).toBeDefined();
    expect(writeData).toHaveBeenCalled();
    expect(invalidateStats).toHaveBeenCalled();
  });

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ price: 50 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('rejects missing price', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });

  it('rejects negative price', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test', price: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });

  it('rejects string price', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test', price: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });
});

describe('Error paths', () => {
  it('GET /api/items returns 500 when readData fails', async () => {
    readData.mockRejectedValue(new Error('ENOENT: no such file'));
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });

  it('GET /api/items returns 500 on malformed JSON', async () => {
    readData.mockRejectedValue(new SyntaxError('Unexpected token'));
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });

  it('POST /api/items returns 500 when writeData fails', async () => {
    writeData.mockRejectedValue(new Error('EACCES: permission denied'));
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test', price: 50 });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});
