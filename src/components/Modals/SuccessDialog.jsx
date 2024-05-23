import React from 'react';
import PropTypes from 'prop-types';

const SuccessDialog = ({ isOpen, onClose, successMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto z-10 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4 text-green-600 flex items-center justify-center">
          <span className="mr-2">✔</span>
          Success
        </h2>
        <p className="mb-4 text-gray-700 text-center">{successMessage}</p>
        <button
          onClick={onClose}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

SuccessDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  successMessage: PropTypes.string.isRequired,
};

export default SuccessDialog;
