import React from 'react';
import PropTypes from 'prop-types';

const Send = ({ onClick, disabled = false, className = "", type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-gray-600 hover:bg-gray-500 text-white rounded-full p-3 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ backgroundColor: '#323330' }}
    >
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <path
          d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

Send.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
};

export default Send; 