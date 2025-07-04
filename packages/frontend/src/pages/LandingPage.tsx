import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Plane, 
  Users, 
  Clock, 
  Shield, 
  MapPin, 
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Cruiser Aviation Platform - Modern Flight School Management</title>
        <meta name="description" content="Transform your flight school operations with our comprehensive aviation management platform. Streamline onboarding, flight logging, and student management." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-aviation-sky to-aviation-flight">
        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="w-8 h-8 text-white" />
              <span className="text-xl font-bold text-white">Cruiser Aviation</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-white hover:text-blue-100 transition-colors">Features</a>
              <a href="#pricing" className="text-white hover:text-blue-100 transition-colors">Pricing</a>
              <a href="#contact" className="text-white hover:text-blue-100 transition-colors">Contact</a>
              <Link 
                to="/login" 
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Take Flight with
              <span className="block text-blue-100">Modern Aviation</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Streamline your flight school operations with our comprehensive platform. 
              From student onboarding to flight logging, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Soar
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform provides all the tools you need to manage your aviation business efficiently.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Onboarding</h3>
                <p className="text-gray-600">
                  AI-powered document processing and verification for seamless student registration.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Flight Logging</h3>
                <p className="text-gray-600">
                  Mobile-first flight hour tracking with GPS integration and photo documentation.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-warning-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Management</h3>
                <p className="text-gray-600">
                  Secure storage and automatic expiry tracking for licenses and medical certificates.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-danger-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Base Support</h3>
                <p className="text-gray-600">
                  Manage multiple flight school locations with centralized administration.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aircraft Management</h3>
                <p className="text-gray-600">
                  Track aircraft availability, maintenance, and rental scheduling.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Invoicing</h3>
                <p className="text-gray-600">
                  SmartBill integration for automated invoice generation and payment tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Flight School?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join hundreds of aviation professionals who trust Cruiser Aviation Platform.
            </p>
            <Link 
              to="/login" 
              className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Plane className="w-6 h-6" />
                  <span className="text-lg font-bold">Cruiser Aviation</span>
                </div>
                <p className="text-gray-400">
                  Modern aviation management platform for flight schools and aircraft rental businesses.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Cruiser Aviation. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}; 