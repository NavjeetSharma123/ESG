import React from 'react';

const icons = {
  document: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 2h7l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v4h4M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 17V3M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="9" width="2.5" height="5" rx="0.5" fill="currentColor" />
      <rect x="10" y="6" width="2.5" height="8" rx="0.5" fill="currentColor" />
      <rect x="14" y="11" width="2.5" height="3" rx="0.5" fill="currentColor" />
    </svg>
  ),
  compliance: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  building: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 17V7l7-4 7 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 17h14M8 17v-4h4v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  leaf: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 17c6-10 14-12 14-12s-2 8-12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  people: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 12c2.5.5 4 2 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  score: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  trend: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 14l5-5 3 3 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 4h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2l7 3v5c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8V5l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const ServiceIcon = ({ name, className }) => {
  const icon = icons[name] || icons.document;
  return <span className={className}>{icon}</span>;
};

export default ServiceIcon;
