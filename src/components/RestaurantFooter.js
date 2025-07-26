'use client';
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';

export default function RestaurantFooter({ openingHours, instagramURL, tiktokURL, facebookURL, primaryColor }) {
  return (
    <footer className="mt-8 text-white" style={{ background: primaryColor }}>
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center space-y-3">
        {openingHours && (
          <p className="text-sm">Opening Hours: {openingHours}</p>
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
