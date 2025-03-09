import React from 'react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-6">Access Denied</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700 mb-4">
            Your email address is not authorized to access this application.
          </p>
          
          <p className="text-gray-700 mb-6">
            This application is restricted to specific users only. If you believe you should have access, please contact the administrator.
          </p>
          
          <p className="text-gray-600 text-sm">
            Authorized emails: service@jvc-co.be and alvarolj23@gmail.com
          </p>
        </div>
        
        <div className="mt-6">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
} 