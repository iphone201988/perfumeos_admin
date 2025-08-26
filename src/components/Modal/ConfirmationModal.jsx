import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, className="text-red-500 border border-red-500 hover:bg-red-500" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center">
      <div className="bg-white p-8 rounded-md max-w-[400px] w-full">
        <h3 className="text-lg font-semibold text-center">{message}</h3>
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="text-gray-500 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`py-2 px-4 rounded-md  hover:text-white ${className} `}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
