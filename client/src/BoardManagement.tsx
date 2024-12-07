// BoardManagement.tsx
import React, { useState } from "react";
import { TierBoard } from "./types";

interface BoardManagementProps {
  boards: TierBoard[];
  currentBoardId: string;
  onBoardChange: (boardId: string) => void;
  onCreateBoard: (name: string) => Promise<void>;
  onDeleteBoard: (boardId: string) => Promise<void>;
  onUpdateBoard: (boardId: string, name: string) => Promise<void>;
}

const BoardManagement: React.FC<BoardManagementProps> = ({
  boards,
  currentBoardId,
  onBoardChange,
  onCreateBoard,
  onDeleteBoard,
  onUpdateBoard,
}) => {
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      setIsCreating(true);
      await onCreateBoard(newBoardName);
      setNewBoardName("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Board Management</h2>

      <div className="space-y-4">
        {/* Current Board Info */}
        {currentBoardId && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Current Board</h3>
            {boards.find((b) => b.id === currentBoardId)?.name}
          </div>
        )}

        {/* Board List */}
        <div>
          <h3 className="text-lg font-medium mb-2">All Boards</h3>
          <div className="space-y-2">
            {boards.map((board) => (
              <div
                key={board.id}
                className={`p-4 rounded-lg border ${
                  board.id === currentBoardId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {editingBoardId === board.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border rounded px-2 py-1"
                      autoFocus
                    />
                    <button
                      onClick={async () => {
                        await onUpdateBoard(board.id, editingName);
                        setEditingBoardId(null);
                      }}
                      className="text-sm px-3 py-1 bg-green-500 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingBoardId(null)}
                      className="text-sm px-3 py-1 bg-gray-500 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{board.name}</h4>
                      <p className="text-sm text-gray-500">
                        {Object.keys(board.characters).length} characters •{" "}
                        {board.tagList.length} tags
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingBoardId(board.id);
                          setEditingName(board.name);
                        }}
                        className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onBoardChange(board.id)}
                        className="text-sm px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        Select
                      </button>
                      {boards.length > 1 && (
                        <button
                          onClick={() => onDeleteBoard(board.id)}
                          className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create New Board */}
        <form onSubmit={handleCreateSubmit} className="mt-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="submit"
              disabled={isCreating || !newBoardName.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardManagement;
