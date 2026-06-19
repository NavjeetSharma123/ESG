import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`ds-badge ${variant === 'accent' ? 'ds-badge--accent' : ''} ${className}`.trim()}>
    {children}
  </span>
);

export default Badge;
