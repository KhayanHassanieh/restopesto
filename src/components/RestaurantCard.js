'use client';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';
import BranchManager from '@/components/BranchManager';
import { daysOfWeek } from '@/utils/openingHours';
import { useMemo } from 'react';
export default function RestaurantCard({
  restaurant,
  branches,
  openBranchId,
  editMode,
  editName,
  editSubdomain,
  editPhone,
  editExpiresAt,
  onToggleBranches,
  editUsername,
  editPassword,
  editInstagramURL,
  editTiktokURL,
  editFacebookURL,
  onToggleEdit,
  onEditChange,
  onUpdate,
  onToggleActive,
  onToggleOpen,
  primaryColor,
  setPrimaryColor,
  backgroundColor,
  setBackgroundColor,
  accentColor,
  setAccentColor
}) {
  const [editBackgroundImageFile, setEditBackgroundImageFile] = useState(null);
  const [previewBackgroundImage, setPreviewBackgroundImage] = useState(null);
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const defaultHours = useMemo(() => {
  return daysOfWeek.reduce((acc, d) => ({
    ...acc,
    [d]: { open: '', close: '' }
  }), {});
}, []);
  const [hours, setHours] = useState(restaurant.hours || defaultHours);
 const showEdit = editMode === restaurant.id;
  const showBranches = openBranchId === restaurant.id;
  useEffect(() => {
  if (showEdit) {
    setHours(prev => {
      if (prev === restaurant.hours || JSON.stringify(prev) === JSON.stringify(restaurant.hours)) {
        return prev;
      }
      return restaurant.hours || defaultHours;
    });
  }
}, [showEdit]);

  const handleHoursChange = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };
 
  // Set initial expiration date when entering edit mode
  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditBackgroundImageFile(file);
      setPreviewBackgroundImage(URL.createObjectURL(file));
    }
  };
  const handleUpdate = (e) => {
    e.preventDefault();
      const hours = hoursEntries.reduce((acc, { day, open, close }) => {
      acc[day] = { open, close };
      return acc;
    }, {});
    
    onUpdate({
      ...(editName && { name: editName }),
      ...(editSubdomain && { subdomain: editSubdomain }),
      ...(editPhone && { phone: editPhone }),
      hours,
      ...(editExpiresAt && { expiresAt: new Date(editExpiresAt) }),
      ...(editUsername && { username: editUsername }),
      ...(editPassword && { password: editPassword }),
      ...(editInstagramURL && { instagramURL: editInstagramURL }),
      ...(editTiktokURL && { tiktokURL: editTiktokURL }),
      ...(editFacebookURL && { facebookURL: editFacebookURL }),
      backgroundImageFile: editBackgroundImageFile,
      logoFile: editLogoFile,

      theme: {
        primaryColor,
        backgroundColor,
        accentColor
      }
    });

  };
  const [showPicker, setShowPicker] = useState({
    primary: false,
    background: false,
    accent: false,
  });

  const togglePicker = (key) => {
    setShowPicker((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }
  const formatExpirationDate = (expiresAt) => {
    if (!expiresAt) return 'Not set';

    try {
      // Handle both Timestamp and string cases
      const date = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

   // Enhanced hours state and handlers
  const [hoursEntries, setHoursEntries] = useState(
    Object.entries(restaurant.hours || defaultHours).map(([day, times]) => ({
      day,
      open: times.open,
      close: times.close
    }))
  );
 const availableDays = daysOfWeek.filter(
    day => !hoursEntries.some(entry => entry.day === day)
  );

 const handleAddHoursEntry = () => {
    if (availableDays.length > 0) {
      setHoursEntries(prev => [
        ...prev,
        { day: availableDays[0], open: '', close: '' }
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

  // Convert hoursEntries back to hours object before saving
 
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start space-x-4">
          {restaurant.logoUrl && (
            <div className="flex-shrink-0">
              <img
                src={restaurant.logoUrl}
                alt="Restaurant logo"
                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {restaurant.name}
              </h3>

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${restaurant.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {restaurant.isActive ? 'Active' : 'Inactive'}

              </span>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${restaurant.isOpen !== false
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {restaurant.isOpen !== false ? 'Open' : 'Closed'}

              </span>

            </div>

            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {restaurant.subdomain}.krave.me
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {restaurant.phone}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Expires: {formatExpirationDate(restaurant.expiresAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/admin/restaurants/${restaurant.id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Manage Menu
          </Link>

          <button
            onClick={() => {
              onToggleBranches(restaurant.id);
              if (showEdit) onToggleEdit(null);
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {showBranches ? 'Hide Branches' : 'View Branches'}
          </button>

          <button
            onClick={() => {
              if (showBranches) onToggleBranches(null);
              onToggleEdit(restaurant);
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {showEdit ? 'Cancel Edit' : 'Edit'}
          </button>

          <button
            onClick={() => onToggleActive(restaurant.id, restaurant.isActive)}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee] ${restaurant.isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {restaurant.isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              )}
            </svg>
            {restaurant.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onToggleOpen(restaurant.id, restaurant.isOpen !== false)}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee] ${restaurant.isOpen !== false
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {restaurant.isOpen !== false ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              )}
            </svg>
            {restaurant.isOpen !== false ? 'Close' : 'Open'}
          </button>
        </div>
      </div>

      {showEdit && (
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Restaurant Name</label>
              <input
                id="name"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                placeholder="Restaurant name"
                value={editName ?? ''}
                onChange={(e) => onEditChange.name(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="logoImage" className="block text-sm font-medium text-gray-700">Logo Image</label>

              {restaurant.logoUrl && !previewLogo && (
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-500 mb-1">Current logo:</p>
                  <img
                    src={restaurant.logoUrl}
                    alt="Current logo"
                    className="h-24 w-24 object-contain rounded-md border border-gray-200"
                  />
                </div>
              )}

              {previewLogo && (
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-500 mb-1">New logo preview:</p>
                  <img
                    src={previewLogo}
                    alt="New logo preview"
                    className="h-24 w-24 object-contain rounded-md border border-gray-200"
                  />
                </div>
              )}

              <input
                id="logoImage"
                name="logoImage"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#7b68ee] file:text-white hover:file:bg-[#6a58d6]"
              />
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">Subdomain</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="subdomain"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                  placeholder="your-restaurant"
                  value={editSubdomain ?? ''}
                  onChange={(e) => onEditChange.subdomain(e.target.value)}
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  .krave.me
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                placeholder="+1234567890"
                value={editPhone ?? ''}
                onChange={(e) => onEditChange.phone(e.target.value)}
              />
            </div>
             <div>
    <label className="block text-sm font-medium text-gray-700">Opening Hours</label>
    <div className="mt-2 space-y-2">
      {hoursEntries.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
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
          />
          <span>-</span>
          <input
            type="time"
            className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800"
            value={entry.close}
            onChange={(e) => handleHoursEntryChange(index, 'close', e.target.value)}
          />

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
    </div>
  </div>

            <div>
              <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700">
                Background Image
              </label>


              {/* Current background image preview */}
              {restaurant.backgroundImageUrl && !previewBackgroundImage && (
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-500 mb-1">Current background image:</p>
                  <img
                    src={restaurant.backgroundImageUrl}
                    alt="Current background"
                    className="h-32 w-full object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}

              {/* New image preview if selected */}
              {previewBackgroundImage && (
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-500 mb-1">New background image:</p>
                  <img
                    src={previewBackgroundImage}
                    alt="New background preview"
                    className="h-32 w-full object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
              <input
                id="backgroundImage"
                name="backgroundImage"
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#7b68ee] file:text-white hover:file:bg-[#6a58d6]"
              />
              <p className="mt-1 text-sm text-gray-500">
                This image will be displayed behind your restaurant logo
              </p>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">User Email / Username</label>
              <input
                id="username"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                placeholder="user@example.com or username"
                value={editUsername}
                onChange={(e) => onEditChange.username(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (optional)</label>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
                value={editPassword}
                onChange={(e) => onEditChange.password(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram Page</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                value={editInstagramURL}
                onChange={(e) => onEditChange.instagramURL(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tiktok Page</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                value={editTiktokURL}
                onChange={(e) => onEditChange.tiktokURL(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook Page</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                value={editFacebookURL}
                onChange={(e) => onEditChange.facebookURL(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">Expiration Date</label>
              <input

                id="expiresAt"
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800 placeholder-gray-400"
                value={editExpiresAt ?? ''}
                onChange={(e) => onEditChange.expiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Theme Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Primary Color */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    onClick={() => togglePicker('primary')}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800"
                  />
                  <div
                    className="w-6 h-6 rounded border cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => togglePicker('primary')}
                  />
                </div>
                {showPicker.primary && (
                  <div className="mt-2 z-10">
                    <SketchPicker
                      color={primaryColor}
                      className=' text-gray-800'
                      onChangeComplete={(color) => setPrimaryColor(color.hex)}
                    />
                  </div>
                )}
              </div>

              {/* Background Color */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Background Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    onClick={() => togglePicker('background')}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm  text-gray-800"
                  />
                  <div
                    className="w-6 h-6 rounded border cursor-pointer"
                    style={{ backgroundColor: backgroundColor }}
                    onClick={() => togglePicker('background')}
                  />
                </div>
                {showPicker.background && (
                  <div className="mt-2 z-10">
                    <SketchPicker
                      className=' text-gray-800'
                      color={backgroundColor}
                      onChangeComplete={(color) => setBackgroundColor(color.hex)}
                    />
                  </div>
                )}
              </div>

              {/* Accent Color */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Accent Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    onClick={() => togglePicker('accent')}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800"
                  />
                  <div
                    className="w-6 h-6 rounded border cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                    onClick={() => togglePicker('accent')}
                  />
                </div>
                {showPicker.accent && (
                  <div className="mt-2 z-10">
                    <SketchPicker
                      className=' text-gray-800'
                      color={accentColor}
                      onChangeComplete={(color) => setAccentColor(color.hex)}
                    />
                  </div>
                )}
              </div>
            </div>


            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onToggleEdit(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {showBranches && (
        <div className="border-t border-gray-200 px-5 py-4">
          <BranchManager restaurantId={restaurant.id} visible={true} />
        </div>
      )}
    </div>
  );
}