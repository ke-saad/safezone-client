import React from 'react';
import PropTypes from 'prop-types';

const ErrorModal = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto z-10 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center justify-center">
          <span className="mr-2">❗</span>
          Error
        </h2>
        <p className="mb-4 text-gray-700 text-center">{errorMessage}</p>
        <button
          onClick={onClose}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
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
