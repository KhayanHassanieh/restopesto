'use client';
import { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { generateMapUrl } from '@/utils/map';

export default function LocationPicker({ onBack, onComplete, initialLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [userPosition, setUserPosition] = useState(initialLocation || null);
  const [center, setCenter] = useState(initialLocation || null);
  const mapRef = useRef(null);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Get current position
  useEffect(() => {
    if (!isLoaded) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPosition(loc);
          if (!center) setCenter(loc);
        },
        (err) => {
          console.error('Error getting location', err);
          if (!center) setCenter({ lat: 0, lng: 0 });
        },
        { enableHighAccuracy: true }
      );
    } else if (!center) {
      setCenter({ lat: 0, lng: 0 });
    }
  }, [isLoaded, center]);

  const handleCenterChanged = () => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    setCenter({ lat: c.lat(), lng: c.lng() });
  };

  if (!isLoaded || !center) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
        Loading map...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm w-full h-full flex flex-col">
      <div className="relative flex-1">
        <GoogleMap
          center={center}
          zoom={18}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onCenterChanged={handleCenterChanged}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        />
        <img
          src="/pin.svg"
          alt="pin"
          className="absolute left-1/2 top-1/2 z-10 w-8 h-8 -translate-x-1/2 -translate-y-full pointer-events-none"
        />
      </div>
      <div className="p-4 space-y-4">
        <p className="text-center text-sm text-gray-800">
          Lat: {center.lat.toFixed(5)}, Lng: {center.lng.toFixed(5)}
        </p>
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (mapRef.current && userPosition) {
                mapRef.current.panTo(userPosition);
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
          >
            Recenter
          </button>
          <button
            type="button"
            onClick={() =>
              onComplete({
                lat: center.lat,
                lng: center.lng,
                mapUrl: generateMapUrl(center.lat, center.lng),
              })
            }
            className="px-4 py-2 text-white rounded-md hover:brightness-110 transition-colors"
            style={{ background: 'var(--theme-primary)' }}
          >
            Confirm
          </button>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-600 underline"
        >
          Back
        </button>
      </div>
    </div>
  );
}
