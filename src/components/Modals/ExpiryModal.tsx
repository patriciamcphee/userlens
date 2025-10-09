// components/Modals/ExpiryModal.tsx
import React from 'react';
import { SessionLink } from '../../types';

interface ExpiryModalProps {
  show: boolean;
  link: SessionLink | null;
  newExpiryDate: string;
  onExpiryDateChange: (date: string) => void;
  onUpdate: () => void;
  onClose: () => void;
}

export function ExpiryModal({
  show,
  link,
  newExpiryDate,
  onExpiryDateChange,
  onUpdate,
  onClose
}: ExpiryModalProps) {
  if (!show || !link) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Expiration Date</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Expiration</label>
          <div className="text-gray-900">{new Date(link.expiresAt).toLocaleString()}</div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">New Expiration Date & Time</label>
          <input
            type="datetime-local"
            value={newExpiryDate}
            onChange={(e) => onExpiryDateChange(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onUpdate}
            disabled={!newExpiryDate}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}