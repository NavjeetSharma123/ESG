import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as: Component = 'button',
  ...props
}) => {
  const classes = [
    'ds-btn',
    `ds-btn--${variant}`,
    size === 'lg' ? 'ds-btn--lg' : '',
    size === 'sm' ? 'ds-btn--sm' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Button;
