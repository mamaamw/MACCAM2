import React from 'react';
import { createPortal } from 'react-dom';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, confirmText = 'Confirmer', cancelText = 'Annuler', type = 'primary' }) => {
  if (!show) return null;

  const buttonClass = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    warning: 'btn-warning',
    success: 'btn-success'
  }[type] || 'btn-primary';

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const modalContent = (
    <div>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1050 }}
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{ display: 'block', zIndex: 1055 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleCancel}
              />
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-light" 
                onClick={handleCancel}
              >
                {cancelText}
              </button>
              <button 
                type="button" 
                className={`btn ${buttonClass}`}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
