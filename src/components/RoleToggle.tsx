'use client';

import { useState } from 'react';
import { useRole } from '@/lib/roleContext';

export function RoleToggle() {
  const { role, attemptSignatoryLogin, switchToReader } = useRole();
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleAttempt() {
    const success = attemptSignatoryLogin(password);
    if (success) {
      setShowPrompt(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  }

  if (role === 'signatory') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Viewing as:</span>
        <button
          onClick={switchToReader}
          className="px-3 py-1 rounded font-medium bg-purple-600 text-white"
        >
          Signatory
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm relative">
      <span className="text-gray-500">Viewing as:</span>
      <button
        onClick={() => setShowPrompt(!showPrompt)}
        className="px-3 py-1 rounded font-medium bg-gray-200 text-gray-700"
      >
        Reader
      </button>

      {showPrompt && (
        <div className="absolute top-full right-0 mt-2 bg-white border rounded shadow-lg p-3 w-56 z-10">
          <p className="text-xs text-gray-500 mb-2">Enter Signatory password:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAttempt()}
            className="w-full border rounded p-1 text-sm mb-2"
            autoFocus
          />
          {error && <p className="text-xs text-red-600 mb-2">Incorrect password.</p>}
          <button
            onClick={handleAttempt}
            className="w-full bg-purple-600 text-white text-sm py-1 rounded"
          >
            Unlock
          </button>
        </div>
      )}
    </div>
  );
}