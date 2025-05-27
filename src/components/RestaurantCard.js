//restaurant card
'use client';
import { useState } from 'react';
import Link from 'next/link';
import BranchManager from '@/components/BranchManager';

export default function RestaurantCard({
  restaurant,
  branches,
  openBranchId,
  editMode,
  editName,
  editSubdomain,
  editPhone,
  onToggleBranches,
  onToggleEdit,
  onEditChange,
  onUpdate,
  onToggleActive
}) {
  const shouldShowBranches = openBranchId === restaurant.id;
  const showEdit = editMode === restaurant.id;

  return (
    <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {restaurant.logoUrl && (
          <img src={restaurant.logoUrl} alt="logo" className="w-16 h-16 object-cover rounded-full border" />
        )}
        <div className="flex-1 space-y-1">
          <p className="text-lg text-gray-800 font-semibold">{restaurant.name}</p>
          <p className="text-sm text-gray-800">{restaurant.subdomain}.restopesto.com</p>
          <p className="text-sm text-gray-800">📞 {restaurant.phone}</p>
          <p className="text-sm text-gray-800">
            🕒 Expires: {restaurant.expiresAt?.toDate().toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 w-32">
          <Link
            href={`/admin/restaurants/${restaurant.id}`}
            className="w-full px-3 py-1 rounded bg-gray-400 text-white text-sm text-center hover:bg-blue-700 transition"
          >
            Manage Menu
          </Link>
          <button
            onClick={() => {
              if (showEdit) onToggleEdit(null);
              onToggleBranches(restaurant.id);
            }}
            className="w-full px-3 py-1 rounded bg-gray-400 text-white text-sm hover:bg-indigo-600 transition"
          >
            Branches
          </button>
          <button
            onClick={() => {
              if (shouldShowBranches) onToggleBranches(null);
              onToggleEdit(restaurant);
            }}
            className="w-full px-3 py-1 rounded bg-gray-400 text-white text-sm hover:bg-yellow-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleActive(restaurant.id, restaurant.isActive)}
            className={`w-full px-3 py-1 text-sm rounded text-white transition ${
              restaurant.isActive ? 'bg-green-800 hover:bg-green-900' : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            {restaurant.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {showEdit && (
        <form
          onSubmit={onUpdate}
          className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3"
        >
          <input
            className="w-full border border-gray-300 p-2 rounded text-gray-800"
            placeholder="Name"
            value={editName ?? ''}
            onChange={(e) => onEditChange.name(e.target.value)}
          />
          <input
            className="w-full border border-gray-300 p-2 rounded text-gray-800"
            placeholder="Subdomain"
            value={editSubdomain ?? ''}
            onChange={(e) => onEditChange.subdomain(e.target.value)}
          />
          <input
            className="w-full border border-gray-300 p-2 rounded text-gray-800"
            placeholder="Phone"
            value={editPhone ?? ''}
            onChange={(e) => onEditChange.phone(e.target.value)}
          />
          <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>
      )}

      {shouldShowBranches && (
        <div className="mt-2 border-t pt-4">
          <BranchManager restaurantId={restaurant.id} visible={true} />
        </div>
      )}
    </div>
  );
}
