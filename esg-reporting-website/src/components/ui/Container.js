import React from 'react';

const Container = ({ children, className = '', as: Component = 'div', ...props }) => (
  <Component className={`ds-container ${className}`.trim()} {...props}>
    {children}
  </Component>
);

export default Container;
