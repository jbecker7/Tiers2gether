import React, { useState, useEffect } from "react";
import TierBoardComponent from "./TierBoard";
import BoardManagement from "./BoardManagement";
import { createTierBoard, getBoards, deleteBoard, updateBoard } from "./api";
import Auth from "./Auth";
import { TierBoard } from "./types";
import "./App.css";
import axios from "axios";

function App() {
  const [boards, setBoards] = useState<TierBoard[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(() => {
    return localStorage.getItem("lastSelectedBoard");
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!document.cookie.includes("connect.sid");
  });
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get("http://localhost:5003/auth/me", { withCredentials: true })
        .then((response) => {
          setUsername(response.data.username);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setUsername("");
        });
    }
  }, [isAuthenticated]);

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

  const handleAuthSuccess = (username: string) => {
    setIsAuthenticated(true);
    setUsername(username);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5003/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setIsAuthenticated(false);
      setUsername("");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleBoardChange = (boardId: string) => {
    setCurrentBoardId(boardId);
    localStorage.setItem("lastSelectedBoard", boardId);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
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
        <div className="container mx-auto flex flex-col items-center px-4 py-4">
          <h1 className="text-4xl font-bold mb-2">Tiers2gether</h1>
          <div className="flex items-center gap-2">
            <span>Logged in as: {username}</span>
            <br></br>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        <div className="board-section">
          <BoardManagement
            boards={boards}
            currentBoardId={currentBoardId || ""}
            username={username}
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
