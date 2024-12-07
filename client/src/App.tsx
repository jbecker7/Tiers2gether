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
  const mockUserId = "user123";

  useEffect(() => {
    const initializeBoards = async () => {
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
  }, []);

  const handleBoardChange = (boardId: string) => {
    setCurrentBoardId(boardId);
    localStorage.setItem("lastSelectedBoard", boardId);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="app-content">
        <div className="board-section">
          <BoardManagement
            boards={boards}
            currentBoardId={currentBoardId || ""}
            onBoardChange={handleBoardChange}
            onCreateBoard={async (name) => {
              const newBoard = await createTierBoard({ name, initialTags: [] });
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
              userId={mockUserId}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
