import React from 'react';
import { EnhancedButton } from './enhanced-button';
import { ArrowRight, Download, Play, Settings, Star } from 'lucide-react';

export const ButtonShowcase = () => {
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-white">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Button Design System</h2>
        <p className="text-slate-600">Minimalistic, professional, and interactive button components</p>
      </div>

      {/* Primary Buttons - Black Background with Premium Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Primary Buttons (Black Background + Premium Effects)</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-black text-white hover:bg-gray-800 transition-all duration-300 px-3 py-1.5 text-sm rounded-md btn-click">
            Click Effect
          </button>
          <button className="bg-black text-white hover:bg-gray-800 transition-all duration-300 px-4 py-2 text-base rounded-md btn-click btn-ripple">
            Ripple Effect
          </button>
          <button className="bg-black text-white hover:bg-gray-800 transition-all duration-300 px-6 py-3 text-lg rounded-md btn-click btn-magnetic">
            Magnetic Effect
          </button>
          <button className="bg-black text-white hover:bg-gray-800 transition-all duration-300 px-6 py-3 text-lg rounded-md flex items-center btn-click btn-ripple btn-particle">
            <ArrowRight className="w-4 h-4 mr-2" />
            All Effects
          </button>
        </div>
      </div>

      {/* Cancel Buttons - Watch Demo Style */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Cancel Buttons (Watch Demo Style)</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-3 py-1.5 text-sm rounded-md btn-click">
            Cancel
          </button>
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-4 py-2 text-base rounded-md btn-click btn-shimmer">
            Cancel
          </button>
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-6 py-3 text-lg rounded-md btn-click btn-bounce-click">
            Cancel
          </button>
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-6 py-3 text-lg rounded-md flex items-center btn-click btn-shimmer btn-magnetic">
            <Settings className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>

      {/* Ghost Buttons - Header/Footer/Navigation Style with Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Ghost Buttons (Navigation + Smooth Effects)</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-3 py-1.5 text-sm rounded-md btn-click">
            Login
          </button>
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-4 py-2 text-base rounded-md btn-click btn-shimmer">
            Watch Demo
          </button>
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-6 py-3 text-lg rounded-md btn-click btn-magnetic">
            View Examples
          </button>
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-6 py-3 text-lg rounded-md flex items-center btn-click btn-shimmer btn-magnetic">
            <Home className="w-4 h-4 mr-2" />
            Home
          </button>
        </div>
      </div>

      {/* Editor Icon Buttons - White Background */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Editor Icon Buttons (White Background + Black Hover)</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black transition-all duration-300 px-3 py-1.5 text-sm rounded-md btn-click btn-ripple">
            <Type className="w-4 h-4" />
          </button>
          <button className="bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black transition-all duration-300 px-4 py-2 text-base rounded-md btn-click btn-ripple">
            <Image className="w-4 h-4" />
          </button>
          <button className="bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black transition-all duration-300 px-6 py-3 text-lg rounded-md btn-click btn-ripple">
            <BarChart3 className="w-4 h-4" />
          </button>
          <button className="bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black transition-all duration-300 px-6 py-3 text-lg rounded-md flex items-center btn-click btn-ripple btn-magnetic">
            <Play className="w-4 h-4 mr-2" />
            Present
          </button>
        </div>
      </div>

      {/* Premium Special Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Premium Special Effects</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-black text-white hover:bg-gray-800 transition-all duration-300 px-6 py-3 text-lg rounded-md btn-click btn-ripple btn-particle">
            <Star className="w-4 h-4 mr-2 inline" />
            Ripple + Particles
          </button>
          <button className="bg-white text-black border border-gray-300 hover:bg-gray-100 transition-all duration-300 px-6 py-3 text-lg rounded-md btn-click btn-shimmer btn-magnetic">
            Shimmer + Magnetic
          </button>
          <button className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-6 py-3 text-lg rounded-md btn-click btn-bounce-click">
            Bounce Click
          </button>
          <button className="bg-black text-white hover:bg-gray-800 transition-all duration-300 px-6 py-3 text-lg rounded-md btn-click btn-ripple btn-magnetic btn-particle">
            <Play className="w-4 h-4 mr-2 inline" />
            All Premium
          </button>
        </div>
      </div>

      {/* Interactive States */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-800">Interactive States</h3>
        <div className="flex flex-wrap gap-4">
          <EnhancedButton variant="primary" ripple glow bounce>
            Hover & Press
          </EnhancedButton>
          <EnhancedButton variant="secondary" disabled>
            Disabled State
          </EnhancedButton>
          <EnhancedButton variant="outline" ripple glow>
            Loading State
          </EnhancedButton>
        </div>
      </div>

      {/* Design Principles */}
      <div className="mt-12 p-6 bg-gray-100 rounded-xl">
        <h3 className="text-xl font-semibold text-black mb-4">Design Principles Applied</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-black mb-2">Visual Design</h4>
            <ul className="space-y-1">
              <li>• Pure black/white color palette only</li>
              <li>• Subtle borders and soft shadows</li>
              <li>• Clean typography and spacing</li>
              <li>• Consistent border radius</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-2">Interactions</h4>
            <ul className="space-y-1">
              <li>• Smooth scale-up on hover</li>
              <li>• Press feedback with scale-down</li>
              <li>• Ripple effects on click</li>
              <li>• Black/white color inversions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-2">Micro-Animations</h4>
            <ul className="space-y-1">
              <li>• Underline slide animations</li>
              <li>• Subtle bounce effects</li>
              <li>• Glow effects on hover</li>
              <li>• Black/white gradient shifts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-2">Performance</h4>
            <ul className="space-y-1">
              <li>• GPU-accelerated transforms</li>
              <li>• Optimized CSS properties</li>
              <li>• Smooth 60fps animations</li>
              <li>• Minimal layout thrashing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
