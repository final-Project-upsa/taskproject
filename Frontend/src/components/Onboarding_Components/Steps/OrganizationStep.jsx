import React, { useState, useEffect } from 'react';
import { Building2, Globe, Briefcase, Users, CircleDollarSign, CheckCircle, XCircle, Loader } from 'lucide-react';
import { debounce } from 'lodash';

const OrganizationStep = ({ formData, handleInputChange, setStepValid }) => {
  const [subdomainError, setSubdomainError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubdomainValid, setIsSubdomainValid] = useState(false);

  // Validate all required fields
  useEffect(() => {
    const isValid = 
      formData.name &&
      formData.subdomain &&
      isSubdomainValid &&
      formData.industry &&
      formData.company_size;
    
    setStepValid(isValid);
  }, [formData, isSubdomainValid, setStepValid]);

  // Debounced function to check subdomain availability
  const checkSubdomainAvailability = debounce(async (subdomain) => {
    if (!subdomain) {
      setSubdomainError('');
      setIsSubdomainValid(false);
      return;
    }

    // Validate subdomain format first
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      setSubdomainError('Subdomain can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen');
      setIsSubdomainValid(false);
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch(`/api/check-subdomain/${subdomain}/`);
      const data = await response.json();
      
      if (!data.available) {
        setSubdomainError('This subdomain is already taken');
        setIsSubdomainValid(false);
      } else {
        setSubdomainError('');
        setIsSubdomainValid(true);
      }
    } catch (error) {
      setSubdomainError('Error checking subdomain availability');
      setIsSubdomainValid(false);
    } finally {
      setIsChecking(false);
    }
  }, 500);

  useEffect(() => {
    return () => {
      checkSubdomainAvailability.cancel();
    };
  }, []);

  const handleSubdomainChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    handleInputChange({ target: { name: 'subdomain', value } });
    checkSubdomainAvailability(value);
  };

  const getSubdomainIcon = () => {
    if (isChecking) {
      return <Loader className="h-5 w-5 text-gray-400 animate-spin" />;
    }
    if (formData.subdomain && isSubdomainValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (formData.subdomain && subdomainError) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization Name*
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Your organization name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subdomain*
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="subdomain"
            value={formData.subdomain}
            onChange={handleSubdomainChange}
            className={`pl-10 pr-32 block w-full rounded-lg border ${
              subdomainError ? 'border-red-300' : isSubdomainValid ? 'border-green-300' : 'border-gray-300'
            } py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            placeholder="your-company"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-500 mr-2">.enterprisesync.com</span>
            {getSubdomainIcon()}
          </div>
        </div>
        {subdomainError ? (
          <p className="mt-1 text-sm text-red-600">{subdomainError}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            Only lowercase letters, numbers, and hyphens allowed
          </p>
        )}
      </div>

      {/* Rest of the fields remain the same... */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Industry*
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Briefcase className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Size*
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="company_size"
            value={formData.company_size}
            onChange={handleInputChange}
            className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1001+">1001+ employees</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual Revenue
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CircleDollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="annual_revenue"
            value={formData.annual_revenue}
            onChange={handleInputChange}
            className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select annual revenue</option>
            <option value="<1M">Prefer not to say</option>
            <option value="1M-10M">$Less than $10,000</option>
            <option value="10M-50M">$10,000 - $50,000</option>
            <option value="50M-100M">$50,000 - $100,000</option>
            <option value="100M+">$100,000+</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://your-company.com"
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationStep;