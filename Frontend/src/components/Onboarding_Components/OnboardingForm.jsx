import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Building2, MapPin, UserCog, Settings, CreditCard, Sparkles, Clock, HelpCircle, Loader2 } from 'lucide-react';

import useAuthStore from '../../stores/authStore';
import { initialFormState } from './InitialFormState';
import OrganizationStep from './Steps/OrganizationStep';
import LocationStep from './Steps/LocationStep';
import AdminStep from './Steps/AdminStep';
import PreferencesStep from './Steps/PreferencesStep';
import BillingStep from './Steps/BillingStep';

const OnboardingForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValid, setStepValid] = useState(false);

  const registerOrg = useAuthStore(state => state.registerOrg);
  const error = useAuthStore(state => state.error);
  const isLoading = useAuthStore(state => state.isLoading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerOrg(formData);
      // Redirect will happen automatically in the store
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };



  const steps = [
    { 
      number: 1, 
      title: 'Organization', 
      component: OrganizationStep,
      icon: Building2,
      description: 'Tell us about your company'
    },
    { 
      number: 2, 
      title: 'Location', 
      component: LocationStep,
      icon: MapPin,
      description: 'Where are you based?'
    },
    { 
      number: 3, 
      title: 'Admin', 
      component: AdminStep,
      icon: UserCog,
      description: 'Create your admin account'
    },
    { 
      number: 4, 
      title: 'Preferences', 
      component: PreferencesStep,
      icon: Settings,
      description: 'Set your preferences'
    },
    // { 
    //   number: 5, 
    //   title: 'Billing', 
    //   component: (props) => <BillingStep {...props} selectedPackage={formData.selectedPackage} />,
    //   icon: CreditCard,
    //   description: 'Add payment details'
    // }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (!stepValid) {
      alert('Please complete all required fields before continuing');
      return;
    }
    
    if (step === 4 && !formData.package) {
      alert('Please select a package before continuing');
      return;
    }
    setStep(prev => Math.min(prev + 1, steps.length));
    setStepValid(false); // Reset validation for next step
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const CurrentStepComponent = steps[step - 1].component;
  const CurrentIcon = steps[step - 1].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Progress Indicator */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 rounded-full p-2 text-white">
                <CurrentIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Step {step} of {steps.length}</h2>
                <p className="text-sm text-gray-500">{steps[step - 1].description}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-indigo-600">
              {Math.round((step / steps.length) * 100)}%
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded">
            <div 
              className="h-full bg-indigo-600 rounded transition-all duration-300"
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Welcome Section - Hidden on Mobile */}
      <div className="hidden md:block max-w-4xl mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to EnterpriseSync</h1>
          <p className="mt-2 text-lg text-gray-600">Let's get your workspace set up so you can start creating amazing things.</p>
          <div className="flex items-center space-x-3 mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" /> 5 min setup
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1" /> 14-day free trial
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Different Max Width for Mobile/Desktop */}
      <div className="md:max-w-4xl mx-auto px-4 py-4 md:py-8 sm:px-6 lg:px-8">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg">
          {/* Desktop Progress Bar - Hidden on Mobile */}
          <div className="hidden md:block px-8 py-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">Step {step} of {steps.length}:</span>
                <span className="text-sm text-gray-500">{steps[step - 1].description}</span>
              </div>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round((step / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded">
              <div 
                className="h-full bg-indigo-600 rounded transition-all duration-300"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content - Fixed Height with Hidden Scrollbar */}
          <div className="h-[600px] overflow-y-auto scrollbar-hide p-4 md:p-8">
            <CurrentStepComponent 
              formData={formData} 
              handleInputChange={handleInputChange} 
              setStepValid={setStepValid} 
            />
          </div>
        </div>

        {/* Navigation Buttons - Outside Card */}
        <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button
            onClick={prevStep}
            disabled={isSubmitting}
            className="flex items-center justify-center px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        ) : <div />}
        
        {step === steps.length ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !stepValid}
            className="flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Start Free Trial'
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={isSubmitting || !stepValid}
            className="flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

        {/* Terms and Privacy */}
        <div className="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="text-indigo-600 hover:text-indigo-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-indigo-600 hover:text-indigo-500">
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Help Button - Fixed Position - Hidden on Mobile */}
      <button 
        className="hidden md:block fixed bottom-8 right-8 bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default OnboardingForm;