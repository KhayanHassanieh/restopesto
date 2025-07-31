'use client';
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';
import { daysOfWeek, formatTime } from '@/utils/openingHours';

export default function RestaurantFooter({ hours, instagramURL, tiktokURL, facebookURL, primaryColor }) {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <footer className="mt-8 text-white" style={{ background: primaryColor }}>
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center space-y-3">
        {hours && (
          <div className="text-sm text-center space-y-1">
            {daysOfWeek.map(day => {
              const info = hours[day] || {};
              const label = !info.open || !info.close || info.open === info.close
                ? 'Closed'
                : `${formatTime(info.open)} - ${formatTime(info.close)}`;
              return (
                <p key={day}>{capitalize(day)}: {label}</p>
              );
            })}
          </div>
        )}
        <div className="flex space-x-4">
          {instagramURL && (
            <a href={instagramURL} target="_blank" rel="noopener noreferrer" className="hover:opacity-75">
              <FaInstagram size={24} />
            </a>
          )}
          {facebookURL && (
            <a href={facebookURL} target="_blank" rel="noopener noreferrer" className="hover:opacity-75">
              <FaFacebook size={24} />
            </a>
          )}
          {tiktokURL && (
            <a href={tiktokURL} target="_blank" rel="noopener noreferrer" className="hover:opacity-75">
              <FaTiktok size={24} />
            </a>
          )}
        </div>
        <p className="text-xs opacity-80">Powered by Krave Menus</p>
      </div>
    </footer>
  );
}
