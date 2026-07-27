'use client';

import { useRole } from '@/lib/roleContext';

export function RoleToggle() {
  const { role, toggleRole } = useRole();

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500">Viewing as:</span>
      <button
        onClick={toggleRole}
        className={`px-3 py-1 rounded font-medium ${
          role === 'signatory'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        {role === 'signatory' ? 'Signatory' : 'Reader'}
      </button>
    </div>
  );
}