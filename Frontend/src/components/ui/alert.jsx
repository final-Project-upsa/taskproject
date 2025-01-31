import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

export const Alert = ({ className, children, variant = 'info', ...props }) => {
  const baseClass =
    'p-4 rounded-md flex items-start space-x-3 border shadow-sm';
  const variantClass = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
  }[variant];

  return (
    <div
      className={clsx(baseClass, variantClass, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className, ...props }) => {
  return (
    <p className={clsx('text-sm', className)} {...props}>
      {children}
    </p>
  );
};

Alert.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
};

AlertDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
