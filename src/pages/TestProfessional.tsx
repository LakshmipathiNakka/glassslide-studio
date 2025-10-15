// Test page for professional editor functionality
import React from 'react';

export default function TestProfessional() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Professional Editor Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simple Professional Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Simple Professional Editor</h2>
            <p className="text-gray-600 mb-4">
              A working version with PowerPoint-style slide editing, placeholders, and text editing.
            </p>
            <a 
              href="/simple-professional"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Try Simple Professional Editor
            </a>
          </div>

          {/* Full Professional Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Full Professional Editor</h2>
            <p className="text-gray-600 mb-4">
              Complete version with Fabric.js, Draft.js, and all advanced features.
            </p>
            <a 
              href="/professional"
              className="inline-block bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
              title="Currently has dependency issues"
            >
              Full Professional (In Development)
            </a>
          </div>

          {/* Simple Enhanced Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Simple Enhanced Editor</h2>
            <p className="text-gray-600 mb-4">
              The existing enhanced editor with canvas and element management.
            </p>
            <a 
              href="/simple-enhanced"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Try Simple Enhanced Editor
            </a>
          </div>

          {/* Home Page */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Home Page</h2>
            <p className="text-gray-600 mb-4">
              Return to the main landing page with all navigation options.
            </p>
            <a 
              href="/"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Go to Home Page
            </a>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span>Simple Professional Editor - Working</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span>Full Professional Editor - Dependency Issues</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span>Simple Enhanced Editor - Working</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span>Development Server - Running</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
