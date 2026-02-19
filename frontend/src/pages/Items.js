import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { List } from 'react-window';
import ItemsSkeleton from '../skeletons/ItemsSkeleton';

// needs to stay in sync with .item-row height in CSS
const ROW_HEIGHT = 50;

function Row({ index, style, items }) {
  const item = items[index];
  return (
    <div className="item-row" style={style}>
      <Link className="item-name" to={'/items/' + item.id}>{item.name}</Link>
      <span className="item-price">${item.price.toLocaleString()}</span>
    </div>
  );
}

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
  const hasItems = items.length > 0;

  return (
    <div className="page">
      <input
        className="search-input"
        type="text"
        placeholder="Search items..."
        aria-label="Search items"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />

      {/* show skeleton on first load, but keep stale rows visible (dimmed) when paginating */}
      {loading && !hasItems ? (
        <ItemsSkeleton />
      ) : error ? (
        <p className="error-msg">Error: {error.message}</p>
      ) : !hasItems ? (
        <p className="empty-msg">No items found.</p>
      ) : (
        <>
          <div className={`items-card${loading ? ' items-loading' : ''}`}>
            <List
              height={Math.min(items.length, 10) * ROW_HEIGHT}
              rowCount={items.length}
              rowHeight={ROW_HEIGHT}
              width="100%"
              rowComponent={Row}
              rowProps={{ items }}
            />
          </div>

          {total > 0 && (
            <div className="pagination">
              <button className="pagination-btn" onClick={() => setPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
                Prev
              </button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button className="pagination-btn" onClick={() => setPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
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
