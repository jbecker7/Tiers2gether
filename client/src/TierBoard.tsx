import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Plus } from "lucide-react";
import { TierBoard, Character, CharacterRanking } from "./types";
import {
  getTierBoard,
  addCharacterToBoard,
  updateCharacterRanking,
  addTagToBoard,
  addUserToBoard,
} from "./api";
import TierListDisplay from "./TierListDisplay";

interface TierBoardProps {
  boardId: string;
  userId: string;
}

const TIERS = ["S", "A", "B", "C", "D"] as const;
const TIER_COLORS = {
  S: "bg-red-300",
  A: "bg-orange-300",
  B: "bg-yellow-200",
  C: "bg-yellow-100",
  D: "bg-green-200",
};

const TierBoardComponent: React.FC<TierBoardProps> = ({ boardId, userId }) => {
  const [board, setBoard] = useState<TierBoard | null>(null);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newUser, setNewUser] = useState("");
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    series: "",
    imageUrl: "",
    tags: [] as string[],
    rankings: [] as CharacterRanking[],
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        setIsLoading(true);
        const data = await getTierBoard(boardId);
        setBoard(data);
      } catch (err) {
        console.error("Failed to load board:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBoard();
  }, [boardId]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const characterId = result.draggableId;
    const newTier = result.destination.droppableId as
      | "S"
      | "A"
      | "B"
      | "C"
      | "D";

    await handleUpdateRanking(characterId, newTier);
  };

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board) return;

    try {
      setIsLoading(true);
      const character: Omit<Character, "id"> = {
        ...newCharacter,
        tags: selectedTags,
        rankings: [],
      };

      await addCharacterToBoard(boardId, character);
      const updatedBoard = await getTierBoard(boardId);
      setBoard(updatedBoard);
      setNewCharacter({
        name: "",
        series: "",
        imageUrl: "",
        tags: [],
        rankings: [],
      });
      setSelectedTags([]);
      setIsAddingCharacter(false);
    } catch (err) {
      console.error("Failed to add character:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRanking = async (
    characterId: string,
    tier: "S" | "A" | "B" | "C" | "D"
  ) => {
    if (!board) return;
    try {
      setIsLoading(true);
      await updateCharacterRanking(boardId, characterId, tier, userId);
      const updatedBoard = await getTierBoard(boardId);
      setBoard(updatedBoard);
    } catch (err) {
      console.error("Failed to update ranking:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board || !newTag.trim()) return;

    try {
      setIsLoading(true);
      await addTagToBoard(boardId, newTag);
      const updatedBoard = await getTierBoard(boardId);
      setBoard(updatedBoard);
      setNewTag("");
      setIsAddingTag(false);
    } catch (err) {
      console.error("Failed to add tag:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAccessKey = async () => {
    if (!board) return;
    try {
      await navigator.clipboard.writeText(board.accessKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy access key:", err);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const charactersByTier = Object.entries(board?.characters || {}).reduce(
    (acc, [id, character]) => {
      const userRanking = character.rankings.find((r) => r.userId === userId);
      const tier = userRanking?.tier || "D";
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push({ id, ...character });
      return acc;
    },
    {} as Record<string, (Character & { id: string })[]>
  );

  if (isLoading && !board) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!board) {
    return <div className="text-red-500">Error: Board not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
              <span className="text-sm text-gray-500">
                Created by: {board.creatorUsername}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {board.tagList.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700"
                >
                  {tag}
                </span>
              ))}
              <button
                onClick={() => setIsAddingTag(true)}
                className="px-3 py-1 border border-dashed border-gray-400 rounded-full text-sm text-gray-600 hover:border-gray-600 transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {board.creatorUsername === userId && (
              <button
                onClick={() => setIsAddingUser(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add User
              </button>
            )}
            <button
              onClick={() => setShowShareDialog(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Share Board
            </button>
            <button
              onClick={() => setIsAddingCharacter(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              <Plus size={20} />
              Add Character
            </button>
          </div>
        </div>
        {board.allowedUsers && board.allowedUsers.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Shared with: {board.allowedUsers.join(", ")}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-8">
        <TierListDisplay
          characters={board.characters}
          userId={userId}
          onCharacterDrop={handleUpdateRanking}
        />
      </div>

      {/* Add Character Modal */}
      <Dialog
        open={isAddingCharacter}
        onClose={() => setIsAddingCharacter(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add New Character
            </Dialog.Title>
            <form onSubmit={handleAddCharacter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Character Name
                </label>
                <input
                  type="text"
                  value={newCharacter.name}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, name: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Series
                </label>
                <input
                  type="text"
                  value={newCharacter.series}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, series: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newCharacter.imageUrl}
                  onChange={(e) =>
                    setNewCharacter({
                      ...newCharacter,
                      imageUrl: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {board.tagList.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingCharacter(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Character"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add User Modal */}
      <Dialog
        open={isAddingUser}
        onClose={() => setIsAddingUser(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm bg-white rounded-lg p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add User to Board
            </Dialog.Title>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await addUserToBoard(boardId, newUser);
                  setIsAddingUser(false);
                  setNewUser("");
                  // Refresh board to show updated users
                  const updatedBoard = await getTierBoard(boardId);
                  setBoard(updatedBoard);
                } catch (err) {
                  console.error("Failed to add user:", err);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm bg-white rounded-lg p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              Share Board
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board Access Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={board.accessKey}
                    readOnly
                    className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  />
                  <button
                    onClick={handleCopyAccessKey}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Share this access key with others to let them view this board
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Tag Modal */}
      <Dialog
        open={isAddingTag}
        onClose={() => setIsAddingTag(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm bg-white rounded-lg p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add New Tag
            </Dialog.Title>
            <form onSubmit={handleAddTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={isLoading || !newTag.trim()}
                >
                  {isLoading ? "Adding..." : "Add Tag"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default TierBoardComponent;
