'use client';
import { useEffect } from 'react';
import StepIndicator from './StepIndicator';

export default function StepModal({ currentStep, children, containerClassName = '', bodyClassName = '' }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-sm w-full max-w-md ${containerClassName}`}>
        <div className="p-6 pb-0">
          <StepIndicator currentStep={currentStep} />
        </div>
        <div className={`px-6 pb-6 ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
