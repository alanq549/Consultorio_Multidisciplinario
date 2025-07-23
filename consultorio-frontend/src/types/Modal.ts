export type ModalContent = {
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
};

export type ModalContextType = {
  showModal: (content: ModalContent) => void;
  hideModal: () => void;
};
