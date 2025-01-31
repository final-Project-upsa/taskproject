import React, { useState, useEffect } from 'react';
import { MapPin, Phone } from 'lucide-react';

const LocationStep = ({ formData, handleInputChange, setStepValid }) => {
  const [phoneError, setPhoneError] = useState('');
  const [postal_codeError, setPostalCodeError] = useState('');

  // Validate phone number format
  const validatePhone = (phone) => {
    // Basic phone validation - can be made more strict based on requirements
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  // Validate postal code based on country
  const validatePostalCode = (postal_code, country) => {
    if (!postal_code || !country) return false;
    
    const patterns = {
      US: /^\d{5}(-\d{4})?$/, // US ZIP code
      CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // Canadian postal code
      GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/, // UK postcode
      AU: /^\d{4}$/ // Australian postcode
    };

    return patterns[country] ? patterns[country].test(postal_code) : true;
  };

  // Handle phone number formatting and validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    handleInputChange(e);
    
    if (!validatePhone(value)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  // Handle postal code validation
  const handlePostalCodeChange = (e) => {
    const value = e.target.value;
    handleInputChange(e);
    
    if (formData.country && !validatePostalCode(value, formData.country)) {
      setPostalCodeError('Please enter a valid postal code for the selected country');
    } else {
      setPostalCodeError('');
    }
  };

  // Validate all required fields
  useEffect(() => {
    const isValid = 
      formData.address_line1 &&
      formData.city &&
      formData.state &&
      formData.postal_code &&
      formData.country &&
      formData.business_phone &&
      !phoneError &&
      !postal_codeError &&
      validatePostalCode(formData.postal_code, formData.country) &&
      validatePhone(formData.business_phone);
    
    setStepValid(isValid);
  }, [formData, phoneError, postal_codeError]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Line 1*
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="address_line1"
            value={formData.address_line1}
            onChange={handleInputChange}
            className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Street address"
            required
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Line 2
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleInputChange}
            className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Apt, suite, unit, etc. (optional)"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City*
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State/Province*
        </label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Postal Code*
        </label>
        <input
          type="text"
          name="postal_code"
          value={formData.postal_code}
          onChange={handlePostalCodeChange}
          className={`block w-full rounded-lg border ${
            postal_codeError ? 'border-red-300' : 'border-gray-300'
          } py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          required
        />
        {postal_codeError && (
          <p className="mt-1 text-sm text-red-600">{postal_codeError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country*
        </label>
        <select
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          <option value="">Select country</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Phone*
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            name="business_phone"
            value={formData.business_phone}
            onChange={handlePhoneChange}
            className={`pl-10 block w-full rounded-lg border ${
              phoneError ? 'border-red-300' : 'border-gray-300'
            } py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            placeholder="+1 (555) 000-0000"
            required
          />
        </div>
        {phoneError && (
          <p className="mt-1 text-sm text-red-600">{phoneError}</p>
        )}
      </div>
    </div>
  );
};

export default LocationStep;