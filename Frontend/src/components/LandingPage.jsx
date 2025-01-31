import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PricingSection from './PricingSection';
import { 
  CheckCircle, MessageSquare, LayoutList, PieChart,
  Users, Clock, MenuIcon, X, ArrowRight, Shield,
  DollarSign
} from 'lucide-react';
import heroImage from '../images/DashboardLayoutView.jpg';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        overflowX: 'hidden', // Hide horizontal scrollbar
        overflowY: 'auto',   // Allow vertical scrollbar
        scrollbarWidth: 'none', // For Firefox (no horizontal scrollbar)
        msOverflowStyle: 'none', // For Internet Explorer and Edge (no horizontal scrollbar)
      }}
    >
      <style>
        {`
          /* Hide scrollbar for Webkit browsers (Chrome, Safari, etc.) */
          ::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      {/* Navbar */}
      <nav className="fixed w-full bg-white border-b border-gray-100 z-50">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">
                Enterprise<span className="text-indigo-600">Sync</span>
              </span>
              <div className="hidden md:flex ml-10 space-x-8">
                <NavLink>Features</NavLink>
                <NavLink>Solutions</NavLink>
                <NavLink>Pricing</NavLink>
                <NavLink>Resources</NavLink>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Sign In</button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Start Free Trial
              </button>
            </div>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden border-b border-gray-100">
            <div className="px-4 py-2 space-y-1">
              <MobileNavLink>Features</MobileNavLink>
              <MobileNavLink>Solutions</MobileNavLink>
              <MobileNavLink>Pricing</MobileNavLink>
              <MobileNavLink>Resources</MobileNavLink>
              <div className="pt-2 space-y-2">
                <button className="w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900">
                  Sign In
                </button>
                <button className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="w-full bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Save 5+ hours per week on task management
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  One platform for all your business needs
                </h1>
                <p className="text-xl text-gray-600">
                  Stop juggling multiple tools. Manage tasks, communicate with your team, and track performance - all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleSignupClick}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                  >
                    Start Free 14-Day Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50">
                    Watch Demo
                  </button>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Free onboarding support</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
                  <img 
                    src={heroImage}
                    alt="Platform Interface"
                    className="rounded-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Stop losing time and money on disconnected tools
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Replace your complex stack of business tools with one simple solution
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <PainPointCard
                icon={<LayoutList />}
                title="Task Management"
                problems={[
                  "Missed deadlines and poor tracking",
                  "Unclear task ownership",
                  "No progress visibility",
                  "Time management issues"
                ]}
              />
              <PainPointCard
                icon={<MessageSquare />}
                title="Communication"
                problems={[
                  "Information scattered across tools",
                  "Messages lost in WhatsApp groups",
                  "No central information hub",
                  "Team misalignment"
                ]}
              />
              <PainPointCard
                icon={<PieChart />}
                title="Performance"
                problems={[
                  "No clear performance metrics",
                  "Difficulty tracking progress",
                  "Limited reporting capabilities",
                  "No actionable insights"
                ]}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Everything you need, nothing you don't
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<Users />}
                title="Team Collaboration"
                description="Unified workspace for tasks and communication. No more switching between apps."
                benefits={[
                  "Built-in team chat",
                  "Task comments and mentions",
                  "File sharing",
                  "Team calendar"
                ]}
              />
              <FeatureCard
                icon={<LayoutList />}
                title="Task Management"
                description="Simple but powerful task management that keeps your team aligned."
                benefits={[
                  "Visual task boards",
                  "Priority management",
                  "Due date tracking",
                  "Progress monitoring"
                ]}
              />
              <FeatureCard
                icon={<PieChart />}
                title="Performance Tracking"
                description="Clear insights into team and project performance without complexity."
                benefits={[
                  "Simple dashboards",
                  "Team performance metrics",
                  "Project progress tracking",
                  "Custom reports"
                ]}
              />
              <FeatureCard
                icon={<Shield />}
                title="Access Control"
                description="Keep your business data secure with role-based permissions."
                benefits={[
                  "User roles and permissions",
                  "Secure data access",
                  "Activity logging",
                  "Data backups"
                ]}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* CTA Section */}
        <section className="w-full bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold text-white">
                Ready to streamline your business?
              </h2>
              <p className="text-xl text-gray-300">
                Join hundreds of businesses already saving time and money with EnterpriseSync
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleSignupClick}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700"
                >
                  Start Free Trial
                </button>
                <button className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Helper Components
const NavLink = ({ children }) => (
  <a className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer">
    {children}
  </a>
);

const MobileNavLink = ({ children }) => (
  <a className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded cursor-pointer">
    {children}
  </a>
);

const PainPointCard = ({ icon, title, problems }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all">
    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
    <ul className="space-y-3">
      {problems.map((problem) => (
        <li key={problem} className="flex items-start gap-2">
          <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
          <span className="text-gray-600">{problem}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FeatureCard = ({ icon, title, description, benefits }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <ul className="space-y-3">
      {benefits.map((benefit) => (
        <li key={benefit} className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
          <span className="text-gray-600">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default LandingPage;