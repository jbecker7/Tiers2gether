import React, { useState, useEffect } from "react";
import TierBoardComponent from "./TierBoard";
import BoardManagement from "./BoardManagement";
import { createTierBoard, getBoards, deleteBoard, updateBoard } from "./api";
import { TierBoard } from "./types";
import "./App.css";

function App() {
  const [boards, setBoards] = useState<TierBoard[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(() => {
    return localStorage.getItem("lastSelectedBoard");
  });
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem("username") || ""
  );
  const [showUsernameSetup, setShowUsernameSetup] = useState(
    !localStorage.getItem("username")
  );

  useEffect(() => {
    const initializeBoards = async () => {
      if (!username) return;

      try {
        setIsLoading(true);
        const existingBoards = await getBoards();

        if (existingBoards && existingBoards.length > 0) {
          setBoards(existingBoards);
          const savedBoardId = localStorage.getItem("lastSelectedBoard");
          const savedBoardExists = existingBoards.some(
            (board) => board.id === savedBoardId
          );

          if (!savedBoardId || !savedBoardExists) {
            setCurrentBoardId(existingBoards[0].id);
            localStorage.setItem("lastSelectedBoard", existingBoards[0].id);
          }
        } else {
          const newBoard = await createTierBoard({
            name: "Default Tier Board",
            initialTags: ["tv", "anime"],
            creatorUsername: username,
          });
          setBoards([newBoard]);
          setCurrentBoardId(newBoard.id);
          localStorage.setItem("lastSelectedBoard", newBoard.id);
        }
      } catch (error) {
        console.error("Failed to initialize boards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeBoards();
  }, [username]);

  const handleBoardChange = (boardId: string) => {
    setCurrentBoardId(boardId);
    localStorage.setItem("lastSelectedBoard", boardId);
  };

  const handleSetUsername = (newUsername: string) => {
    localStorage.setItem("username", newUsername);
    setUsername(newUsername);
    setShowUsernameSetup(false);
  };

  if (showUsernameSetup) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4">Choose Your Username</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem(
                "username"
              ) as HTMLInputElement;
              if (input.value.trim().length >= 3) {
                handleSetUsername(input.value.trim());
              }
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                minLength={3}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter username (minimum 3 characters)"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Set Username
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <header className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Tier Board App</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Logged in as: {username}</span>
            <button
              onClick={() => {
                localStorage.removeItem("username");
                setShowUsernameSetup(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Change Username
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        <div className="board-section">
          <BoardManagement
            boards={boards}
            currentBoardId={currentBoardId || ""}
            onBoardChange={handleBoardChange}
            onCreateBoard={async (name) => {
              const newBoard = await createTierBoard({
                name,
                initialTags: [],
                creatorUsername: username,
              });
              setBoards((prev) => [...prev, newBoard]);
              setCurrentBoardId(newBoard.id);
              localStorage.setItem("lastSelectedBoard", newBoard.id);
            }}
            onDeleteBoard={async (boardId) => {
              await deleteBoard(boardId);
              setBoards((prev) => prev.filter((b) => b.id !== boardId));
              if (currentBoardId === boardId) {
                const remainingBoard = boards.find((b) => b.id !== boardId);
                if (remainingBoard) {
                  setCurrentBoardId(remainingBoard.id);
                  localStorage.setItem("lastSelectedBoard", remainingBoard.id);
                }
              }
            }}
            onUpdateBoard={async (boardId, name) => {
              await updateBoard(boardId, { name });
              setBoards((prev) =>
                prev.map((board) =>
                  board.id === boardId ? { ...board, name } : board
                )
              );
            }}
          />
        </div>

        {currentBoardId && (
          <div className="tier-board-section">
            <TierBoardComponent
              key={currentBoardId}
              boardId={currentBoardId}
              userId={username}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
