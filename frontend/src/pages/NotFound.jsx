import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass p-8 rounded-[2rem] border border-white/5">
        <div className="text-4xl font-black tracking-tight">404</div>
        <div className="text-white/50 mt-2">
          No page found for <span className="font-mono text-white/70">{location.pathname}</span>
        </div>
        <div className="mt-6">
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

