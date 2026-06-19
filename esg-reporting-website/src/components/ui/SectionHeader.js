import React from 'react';

const SectionHeader = ({ eyebrow, title, description, align = 'left' }) => (
  <header className={`ds-section-header ${align === 'center' ? 'ds-section-header--center' : ''}`}>
    {eyebrow && <p className="ds-section-header__eyebrow">{eyebrow}</p>}
    <h2 className="ds-section-header__title">{title}</h2>
    {description && <p className="ds-section-header__description">{description}</p>}
  </header>
);

export default SectionHeader;
