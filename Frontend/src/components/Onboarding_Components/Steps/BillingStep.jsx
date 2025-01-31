import React from 'react';
import { CreditCard, Star } from 'lucide-react';

const BillingStep = ({ formData, handleInputChange, setStepValid }) => {
  // Simple validation functions
  const validateForm = () => {
    const isCardNumberValid = /^[\d\s-]{15,19}$/.test(formData.cardNumber?.replace(/\s+/g, '') || '');
    const isExpiryValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate || '');
    const isCvvValid = /^[0-9]{3,4}$/.test(formData.cvv || '');
    const isNameValid = (formData.cardholderName || '').length > 0;

    const isValid = isCardNumberValid && isExpiryValid && isCvvValid && isNameValid;
    setStepValid(isValid);
    
    return {
      cardNumber: !isCardNumberValid && formData.cardNumber ? 'Invalid card number' : '',
      expiry: !isExpiryValid && formData.expiryDate ? 'Invalid expiry date' : '',
      cvv: !isCvvValid && formData.cvv ? 'Invalid CVV' : ''
    };
  };

  const errors = validateForm();

  const selectedPackage = {
    starter: { name: 'Starter Plan', price: '$59.99' },
    growth: { name: 'Growth Plan', price: '$129.99' },
    enterprise: { name: 'Enterprise Plan', price: '$249.99' }
  }[formData.package] || { name: 'Selected Plan', price: '—' };

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Card Number*
            </label>
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                name="cardNumber"
                value={formData.cardNumber || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                } pl-12 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="1234 5678 9012 3456"
              />
              <CreditCard className="absolute left-4 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date*
              </label>
              <input
                id="expiryDate"
                type="text"
                name="expiryDate"
                value={formData.expiryDate || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.expiry ? 'border-red-300' : 'border-gray-300'
                } px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="MM/YY"
              />
              {errors.expiry && (
                <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
              )}
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                CVV*
              </label>
              <input
                id="cvv"
                type="text"
                name="cvv"
                value={formData.cvv || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.cvv ? 'border-red-300' : 'border-gray-300'
                } px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="123"
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name*
            </label>
            <input
              id="cardholderName"
              type="text"
              name="cardholderName"
              value={formData.cardholderName || ''}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Name on card"
            />
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedPackage.name}</h4>
              <p className="text-gray-500 mt-1">{selectedPackage.price}/month after trial</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 mr-2" />
              14-day free trial
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingStep;