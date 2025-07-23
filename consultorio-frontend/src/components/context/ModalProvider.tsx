import React, { useState, useEffect } from "react";
import { ModalContext } from "./ModalContext";
import type { ModalContent } from "../../types/Modal";
import "../../styles/context/modal.css";

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const showModal = (content: ModalContent) => {
    setIsAnimating(true);
    setModalContent(content);
  };

  const hideModal = () => {
    setIsAnimating(false);
    setTimeout(() => setModalContent(null), 300); // Match animation duration
  };

  const handleConfirm = () => {
    modalContent?.onConfirm?.();
    hideModal();
  };

  const handleCancel = () => {
    modalContent?.onCancel?.();
    hideModal();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && modalContent) {
      hideModal();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalContent]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}

      {modalContent && (
        <div className={`modal-backdrop ${isAnimating ? "entering" : "exiting"}`}>
          <div className={`modal ${isAnimating ? "entering" : "exiting"}`}>
            <div className="modal-header">
              {modalContent.title && (
                <h2 className="modal-title">{modalContent.title}</h2>
              )}
              <button 
                onClick={hideModal} 
                className="modal-close"
                aria-label="Cerrar modal"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {typeof modalContent.message === "string" ? (
                <p className="modal-message">{modalContent.message}</p>
              ) : (
                modalContent.message
              )}
            </div>

            <div className="modal-footer">
              {modalContent.cancelText && (
                <button 
                  onClick={handleCancel}
                  className="modal-button cancel-button"
                >
                  {modalContent.cancelText}
                </button>
              )}
              {modalContent.confirmText && (
                <button 
                  onClick={handleConfirm}
                  className="modal-button confirm-button"
                >
                  {modalContent.confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};