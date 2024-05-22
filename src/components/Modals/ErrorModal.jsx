import React from 'react';
import PropTypes from 'prop-types';

const ErrorModal = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto z-10">
        <h2 className="text-2xl font-semibold mb-4 text-red-600 flex items-center">
          <span className="mr-2">❗</span>
          Error
        </h2>
        <p className="mb-4 text-gray-700 text-lg leading-relaxed">{errorMessage}</p>
        <button
          onClick={onClose}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

ErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

export default ErrorModal;
