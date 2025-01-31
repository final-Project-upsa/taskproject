import React, { useEffect } from 'react';
import { Mail, Check, Star } from 'lucide-react';

const PreferencesStep = ({ formData, handleInputChange, setStepValid }) => {
  // Validate all required fields
  useEffect(() => {
    const isValid = 
      formData.timezone && 
      formData.language && 
      formData.selected_package;
    
    setStepValid(isValid);
  }, [formData, setStepValid]);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Basic Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone*
          </label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select timezone</option>
            <option value="PT">Pacific Time (PT)</option>
            <option value="ET">Eastern Time (ET)</option>
            <option value="GMT">Greenwich Mean Time (GMT)</option>
            <option value="CET">Central European Time (CET)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language*
          </label>
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      {/* Package Selection */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Package</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Starter Package */}
          <div className="border rounded-lg p-6 hover:border-indigo-500 cursor-pointer transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">Starter</h4>
                <p className="text-sm text-gray-500">Perfect for growing teams</p>
              </div>
              <input
                type="radio"
                name="selected_package"
                value="starter"
                checked={formData.selected_package === 'starter'}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600"
              />
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">$59.99</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Up to 25 users
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                $2.40 - $12.00 per user/month
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                +$5.59/user after 25 users
              </li>
            </ul>
          </div>

          {/* Growth Package */}
          <div className="border-2 border-indigo-500 rounded-lg p-6 relative hover:shadow-lg transition-all">
            <div className="absolute -top-3 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm">
              Recommended
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">Growth</h4>
                <p className="text-sm text-gray-500">For scaling teams</p>
              </div>
              <input
                type="radio"
                name="selected_package"
                value="growth"
                checked={formData.selected_package === 'growth'}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600"
              />
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">$129.99</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Up to 50 users
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                $2.60 - $13.00 per user/month
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                +$8.99/user after 50 users
              </li>
            </ul>
          </div>

          {/* Enterprise Package */}
          <div className="border rounded-lg p-6 hover:border-indigo-500 cursor-pointer transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">Enterprise</h4>
                <p className="text-sm text-gray-500">For large organizations</p>
              </div>
              <input
                type="radio"
                name="selected_package"
                value="enterprise"
                checked={formData.selected_package === 'enterprise'}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600"
              />
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">$249.99</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Up to 100 users
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                $2.50 - $12.50 per user/month
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                +$11.99/user/month after 100 users
              </li>
            </ul>
          </div>
        </div>

        {/* Package Pricing Details Link */}
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            See package pricing details
          </a>
        </div>
      </div>
    </div>
  );
};

export default PreferencesStep;
