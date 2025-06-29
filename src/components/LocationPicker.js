'use client';
import { useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export default function LocationPicker({ onBack, onConfirm, initialLocation }) {
  const [position, setPosition] = useState(initialLocation);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (!isLoaded || position) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setPosition({ lat: 0, lng: 0 });
        }
      );
    } else {
      setPosition({ lat: 0, lng: 0 });
    }
  }, [isLoaded, position]);

  const handleDragEnd = (e) => {
    setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  if (!isLoaded || !position) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
        Loading map...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Location</h2>
      <div className="h-64 mb-4">
        <GoogleMap
          center={position}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          <Marker position={position} draggable onDragEnd={handleDragEnd} />
        </GoogleMap>
      </div>
      <p className="text-sm text-gray-800 mb-4">
        Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
      </p>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onConfirm(position)}
          className="px-4 py-2 text-white rounded-md hover:brightness-110 transition-colors"
          style={{ background: 'var(--theme-primary)' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
