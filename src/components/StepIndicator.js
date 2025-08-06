'use client';
import React from 'react';

const steps = ['checkout', 'location', 'payment'];

export default function StepIndicator({ currentStep }) {
  const currentIndex = steps.indexOf(currentStep);
  return (
    <div className="flex items-center w-full max-w-xs mx-auto">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              index <= currentIndex
                ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)]'
                : 'border-gray-300 bg-white'
            }`}
          />
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                index < currentIndex
                  ? 'bg-[var(--theme-primary)]'
                  : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
