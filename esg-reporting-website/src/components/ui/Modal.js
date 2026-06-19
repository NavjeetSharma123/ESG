import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, ariaLabelledBy }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ds-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="ds-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        <button
          type="button"
          className="ds-modal__close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
