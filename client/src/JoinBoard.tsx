import React, { useState } from "react";
import { getBoardByAccessKey } from "./api";

interface JoinBoardProps {
  onBoardJoined: (boardId: string) => void;
}

const JoinBoard: React.FC<JoinBoardProps> = ({ onBoardJoined }) => {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const board = await getBoardByAccessKey(accessKey);
      onBoardJoined(board.id);
    } catch (err) {
      setError("Invalid access key or board not found");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Join a Board</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Access Key
          </label>
          <input
            type="text"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter board access key"
            required
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Joining..." : "Join Board"}
        </button>
      </form>
    </div>
  );
};

export default JoinBoard;
