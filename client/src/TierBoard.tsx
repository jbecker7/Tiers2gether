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
  const [copySuccess, setCopySuccess] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    series: "",
    imageUrl: "",
    tags: [] as string[],
    rankings: [] as CharacterRanking[],
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

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
    tier: "S" | "A" | "B" | "C" | "D",
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board || !newUser.trim()) return;

    try {
      setIsLoading(true);
      await addUserToBoard(boardId, newUser);
      const updatedBoard = await getTierBoard(boardId);
      setBoard(updatedBoard);
      setNewUser("");
      setIsAddingUser(false);
    } catch (err) {
      console.error("Failed to add user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
              <span className="text-sm text-gray-500">
                Created by: {board.creatorUsername}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              Current Tags:{" "}
              {board.tagList.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700"
                >
                  {tag + " "}
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              <Plus size={13} /> {/* Adjust the size here */}
              <span className="ml-2">Add Character</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
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
        <div className="dialog-overlay">
          <div className="dialog-content">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add New Character
            </Dialog.Title>
            <form onSubmit={handleAddCharacter} className="modal-form">
              <div className="modal-form-group">
                <label className="text-sm font-medium text-gray-700">
                  Character Name
                </label>
                <input
                  type="text"
                  value={newCharacter.name}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="text-sm font-medium text-gray-700">
                  Series
                </label>
                <input
                  type="text"
                  value={newCharacter.series}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, series: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="text-sm font-medium text-gray-700">
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
                  className="input-field"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {board.tagList.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`tag ${
                        selectedTags.includes(tag) ? "selected" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsAddingCharacter(false)}
                  className="button button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Character"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Add User Modal */}
      <Dialog
        open={isAddingUser}
        onClose={() => setIsAddingUser(false)}
        className="relative z-50"
      >
        <div className="dialog-overlay">
          <div className="dialog-content">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add User to Board
            </Dialog.Title>
            <form onSubmit={handleAddUser} className="modal-form">
              <div className="modal-form-group">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="button button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isLoading}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        className="relative z-50"
      >
        <div className="dialog-overlay">
          <div className="dialog-content">
            <Dialog.Title className="text-xl font-bold mb-4">
              Share Board
            </Dialog.Title>
            <div className="modal-form">
              <div className="modal-form-group">
                <label className="text-sm font-medium text-gray-700">
                  Board Access Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={board.accessKey}
                    readOnly
                    className="input-field mb-0"
                  />
                  <button
                    onClick={handleCopyAccessKey}
                    className="button button-primary whitespace-nowrap"
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Share this access key with others to let them view this board
                </p>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="button button-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Add Tag Modal */}
      <Dialog
        open={isAddingTag}
        onClose={() => setIsAddingTag(false)}
        className="relative z-50"
      >
        <div className="dialog-overlay">
          <div className="dialog-content">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add New Tag
            </Dialog.Title>
            <form onSubmit={handleAddTag} className="modal-form">
              <div className="modal-form-group">
                <label className="text-sm font-medium text-gray-700">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="button button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isLoading || !newTag.trim()}
                >
                  {isLoading ? "Adding..." : "Add Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default TierBoardComponent;
