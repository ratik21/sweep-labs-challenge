import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ItemDetailSkeleton from '../skeletons/ItemDetailSkeleton';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/items/' + id, { signal: controller.signal })
      // fetch doesn't throw on 4xx/5xx, so reject manually
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setItem)
      .catch(err => {
        if (err.name === 'AbortError') return;
        navigate('/');
      });
    return () => controller.abort();
  }, [id, navigate]);

  if (!item) return <ItemDetailSkeleton />;

  return (
    <div className="page">
      <Link className="detail-back" to="/">&larr; Back to items</Link>
      <div className="detail-card">
        <h2 className="detail-title">{item.name}</h2>
        <div className="detail-row">
          <span className="detail-label">Category</span>
          <span className="detail-value">{item.category}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Price</span>
          <span className="detail-value">${item.price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
