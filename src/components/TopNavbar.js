import React from 'react';

function TopNavbar({ className, onLogout }) {
  return (
    <div className={className}>
      <h2>Following</h2>
      <h2><span>For You</span></h2>
      <button onClick={onLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default TopNavbar;
