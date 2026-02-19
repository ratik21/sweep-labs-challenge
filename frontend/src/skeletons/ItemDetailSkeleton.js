import React from 'react';

function ItemDetailSkeleton() {
  return (
    <div className="page">
      <div className="skeleton-bar" style={{ width: 120, marginBottom: 16 }} />
      <div className="detail-card">
        <div className="skeleton-bar detail-skeleton-title" />
        <div className="detail-row">
          <div className="skeleton-bar" style={{ width: 70 }} />
          <div className="skeleton-bar" style={{ width: 100, marginLeft: 30 }} />
        </div>
        <div className="detail-row">
          <div className="skeleton-bar" style={{ width: 50 }} />
          <div className="skeleton-bar" style={{ width: 70, marginLeft: 50 }} />
        </div>
      </div>
    </div>
  );
}

export default ItemDetailSkeleton;
