'use client';
import { useState, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { daysOfWeek } from '@/utils/openingHours';

export default function OpeningHoursDashboard({ restaurant, onRestaurantUpdate }) {
  const defaultHours = useMemo(() => (
    daysOfWeek.reduce((acc, d) => ({ ...acc, [d]: { open: '', close: '', is24Hours: false } }), {})
  ), []);

  const [hoursEntries, setHoursEntries] = useState(
    Object.entries(restaurant.hours || defaultHours).map(([day, times]) => ({
      day,
      open: times.open,
      close: times.close,
      is24Hours: times.is24Hours || false
    }))
  );

  const [isOpen, setIsOpen] = useState(restaurant.isOpen !== false);
  const [saving, setSaving] = useState(false);

  const availableDays = daysOfWeek.filter(
    day => !hoursEntries.some(entry => entry.day === day)
  );

  const handleAddHoursEntry = () => {
    if (availableDays.length > 0) {
      setHoursEntries(prev => [
        ...prev,
        { day: availableDays[0], open: '', close: '', is24Hours: false }
      ]);
    }
  };

  const handleRemoveHoursEntry = (index) => {
    setHoursEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleHoursEntryChange = (index, field, value) => {
    setHoursEntries(prev =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const hours = hoursEntries.reduce((acc, { day, open, close, is24Hours }) => {
      acc[day] = { open, close, is24Hours };
      return acc;
    }, {});
    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id), { hours });
      onRestaurantUpdate({ hours });
    } catch (error) {
      console.error('Error updating hours:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpen = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id), { isOpen: newStatus });
      onRestaurantUpdate({ isOpen: newStatus });
    } catch (error) {
      console.error('Error toggling open status:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Opening Hours</h2>
        <button
          type="button"
          onClick={handleToggleOpen}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${isOpen ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'}`}
        >
          {isOpen ? 'Close Restaurant' : 'Open Restaurant'}
        </button>
      </div>
      <form onSubmit={handleSave} className="space-y-2">
        {hoursEntries.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 flex-wrap">
            <select
              value={entry.day}
              onChange={(e) => handleHoursEntryChange(index, 'day', e.target.value)}
              className="block w-32 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800"
            >
              {daysOfWeek.map(day => (
                <option
                  key={day}
                  value={day}
                  disabled={hoursEntries.some(e => e.day === day && e !== entry)}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="time"
              className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800"
              value={entry.open}
              onChange={(e) => handleHoursEntryChange(index, 'open', e.target.value)}
              disabled={entry.is24Hours}
            />
            <span>-</span>
            <input
              type="time"
              className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800"
              value={entry.close}
              onChange={(e) => handleHoursEntryChange(index, 'close', e.target.value)}
              disabled={entry.is24Hours}
            />
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={entry.is24Hours}
                onChange={(e) => handleHoursEntryChange(index, 'is24Hours', e.target.checked)}
                className="h-4 w-4 text-[#7b68ee] border-gray-300 rounded"
              />
              <span className="text-xs text-gray-700">24h</span>
            </label>
            <button
              type="button"
              onClick={() => handleRemoveHoursEntry(index)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {availableDays.length > 0 && (
          <button
            type="button"
            onClick={handleAddHoursEntry}
            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-[#7b68ee] bg-[#7b68ee]/10 hover:bg-[#7b68ee]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Hours
          </button>
        )}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            {saving ? 'Saving...' : 'Save Hours'}
          </button>
        </div>
      </form>
    </div>
  );
}

