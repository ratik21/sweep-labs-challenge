import React from 'react';

const SKELETON_WIDTHS = [45, 65, 35, 55, 40, 50, 60, 30, 48, 58];

function ItemsSkeleton() {
  return (
    <div className="items-card">
      {SKELETON_WIDTHS.map((w, i) => (
        <div key={i} className="item-row skeleton-row">
          <div className="skeleton-bar" style={{ width: `${w}%` }} />
          <div className="skeleton-bar skeleton-price" />
        </div>
      ))}
    </div>
  );
}

export default ItemsSkeleton;
