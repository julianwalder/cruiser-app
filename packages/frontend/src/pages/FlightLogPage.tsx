import React from 'react';
import { Helmet } from 'react-helmet-async';

export const FlightLogPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Flight Log - Cruiser Aviation Platform</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">Flight Log</h1>
          <p className="mt-2 text-gray-600">Track and manage your flight hours</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-gray-500">
            <p>Flight logging functionality coming soon...</p>
            <p className="mt-2">This will include GPS tracking, photo documentation, and automatic hour logging.</p>
          </div>
        </div>
      </div>
    </>
  );
}; 