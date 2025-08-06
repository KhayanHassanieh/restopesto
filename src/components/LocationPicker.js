'use client';
import { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { generateMapUrl } from '@/utils/map';

export default function LocationPicker({ onBack, onConfirm, initialLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [userPosition, setUserPosition] = useState(initialLocation || null);
  const [center, setCenter] = useState(initialLocation || null);
  const [permissionState, setPermissionState] = useState(null);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const mapRef = useRef(null);

  // Check geolocation permission on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((p) => {
        setPermissionState(p.state);
        if (p.state === 'denied') {
          setShowPermissionAlert(true);
        }
        p.onchange = () => {
          setPermissionState(p.state);
          if (p.state === 'denied') {
            setShowPermissionAlert(true);
          } else {
            setShowPermissionAlert(false);
          }
        };
      });
    }
  }, []);

  // Get current position once loaded and permission allows
  useEffect(() => {
    if (!isLoaded) return;
    if (!navigator.geolocation) {
      if (!center) setCenter({ lat: 0, lng: 0 });
      return;
    }

    if (permissionState === 'denied') {
      if (!center) setCenter({ lat: 0, lng: 0 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPosition(loc);
        if (!center) setCenter(loc);
      },
      (err) => {
        console.error('Error getting location', err);
        if (!center) setCenter({ lat: 0, lng: 0 });
        if (err.code === err.PERMISSION_DENIED) {
          setShowPermissionAlert(true);
        }
      },
      { enableHighAccuracy: true }
    );
  }, [isLoaded, permissionState]);

  const handleIdle = () => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    const newLat = c.lat();
    const newLng = c.lng();
    if (!center || newLat !== center.lat || newLng !== center.lng) {
      setCenter({ lat: newLat, lng: newLng });
    }
  };

  if (!isLoaded || !center) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Permission Denied Alert */}
      {showPermissionAlert && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Location access is blocked. To use this feature, please enable location permissions in your browser settings.
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowPermissionAlert(false)}
                  className="text-sm text-red-600 hover:text-red-500 focus:outline-none"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex-1">
        <GoogleMap
          center={center}
          zoom={18}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onIdle={handleIdle}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        />
        {/* Pin Icon with fallback */}
        <div className="absolute left-1/2 top-1/2 z-10 w-8 h-8 -translate-x-1/2 -translate-y-full pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="var(--theme-primary)"
            className="w-full h-full"
          >
            <path
              fillRule="evenodd"
              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (mapRef.current && userPosition) {
                mapRef.current.panTo(userPosition);
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            disabled={!userPosition}
          >
            {userPosition ? 'Recenter' : 'Location unavailable'}
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm({
                lat: center.lat,
                lng: center.lng,
                mapUrl: generateMapUrl(center.lat, center.lng),
              })
            }
            className="px-4 py-2 text-white rounded-md hover:brightness-110 transition-colors"
            style={{ background: 'var(--theme-primary)' }}
          >
            Confirm Location
          </button>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm text-gray-600 underline hover:text-gray-800"
        >
          Back to previous step
        </button>
      </div>
    </div>
  );
}