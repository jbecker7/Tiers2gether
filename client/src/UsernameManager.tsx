import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface UsernameManagerProps {
  onUsernameSet: (username: string) => void;
}

const UsernameManager: React.FC<UsernameManagerProps> = ({ onUsernameSet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      onUsernameSet(savedUsername);
    } else {
      setIsOpen(true);
    }
  }, [onUsernameSet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    localStorage.setItem("username", username.trim());
    onUsernameSet(username.trim());
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}} // Prevent closing without username
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm bg-white rounded-lg p-6">
          <Dialog.Title className="text-xl font-bold mb-4">
            Choose Your Username
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter username"
                required
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Set Username
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UsernameManager;
