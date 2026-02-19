import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, total, page, setPage, query, setQuery, loading, error, fetchItems, PAGE_SIZE } = useData();
  const [inputValue, setInputValue] = useState(query);

  // Debounced search: update query after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(inputValue);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, setQuery, setPage]);

  // Fetch items whenever page or query changes (via fetchItems dependency)
  useEffect(() => {
    const controller = new AbortController();
    fetchItems(controller.signal);
    return () => controller.abort();
  }, [fetchItems]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ padding: 16 }}>
      <input
        type="text"
        placeholder="Search items..."
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        style={{ padding: 8, marginBottom: 16, width: '100%', boxSizing: 'border-box' }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map(item => (
              <li key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <Link to={'/items/' + item.id}>{item.name}</Link>
                <span style={{ marginLeft: 8, color: '#666' }}>${item.price}</span>
              </li>
            ))}
          </ul>

          {total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
                Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Items;
