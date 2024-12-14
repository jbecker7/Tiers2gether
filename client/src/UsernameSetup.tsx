import React, { useState } from "react";

interface UsernameSetupProps {
  onUsernameSet: (username: string) => void;
}

const UsernameSetup: React.FC<UsernameSetupProps> = ({ onUsernameSet }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    const finalUsername = username.trim();
    localStorage.setItem("username", finalUsername);
    onUsernameSet(finalUsername);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Choose Your Username</h2>

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
      </div>
    </div>
  );
};

export default UsernameSetup;
