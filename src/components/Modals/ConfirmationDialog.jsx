import React from 'react';
import PropTypes from 'prop-types';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto z-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Confirmation</h2>
        <p className="mb-4 text-gray-700">Are you sure you want to save these updates?</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ConfirmationDialog;
