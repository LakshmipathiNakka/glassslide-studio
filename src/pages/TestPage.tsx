import React, { useState, useRef, useEffect } from 'react';
import Moveable from 'react-moveable';

// Simple test page to verify Moveable.js is working
export const TestPage = () => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetRef.current) {
      setTarget(targetRef.current);
    }
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Moveable.js Test Page</h1>
      
      <div className="w-full h-96 bg-white border border-gray-300 relative">
        <div
          ref={targetRef}
          className="absolute top-20 left-20 w-32 h-32 bg-blue-500 text-white flex items-center justify-center rounded-lg cursor-pointer"
          style={{ transform: 'translate(0px, 0px) rotate(0deg)' }}
        >
          Drag Me!
        </div>

        {target && (
          <Moveable
            target={target}
            draggable={true}
            resizable={true}
            rotatable={true}
            onDrag={({ target, transform }) => {
              target.style.transform = transform;
            }}
            onResize={({ target, width, height, transform }) => {
              target.style.width = `${width}px`;
              target.style.height = `${height}px`;
              target.style.transform = transform;
            }}
            onRotate={({ target, transform }) => {
              target.style.transform = transform;
            }}
            style={{
              zIndex: 1000,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'auto',
            }}
          />
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        If you can see handles around the blue box and can drag/resize/rotate it, Moveable.js is working!
      </div>
    </div>
  );
};
