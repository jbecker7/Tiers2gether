import React, { useState, useEffect } from "react";
import TierBoardComponent from "./TierBoard";
import BoardManagement from "./BoardManagement";
import UsernameSetup from "./UsernameSetup";
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

  if (showUsernameSetup) {
    return (
      <UsernameSetup
        onUsernameSet={(newUsername) => {
          setUsername(newUsername);
          setShowUsernameSetup(false);
        }}
      />
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
              userId={username} // Changed from mockUserId to username
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
