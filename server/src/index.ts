import express, { Request, Response, RequestHandler } from "express";
import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import cors from "cors";
import session from "express-session";
import bcrypt from "bcryptjs";
import serviceAccount from "./firebase/serviceAccountKey.json";

import {
  TierBoard,
  CreateBoardRequest,
  UpdateRankingRequest,
  AddTagRequest,
  UserProfile,
  AddUserToBoardRequest,
  User,
  LoginRequest,
  RegisterRequest,
  Character,
} from "./types";

// Add this interface for character requests
interface AddCharacterRequest {
  boardId: string;
  character: Omit<Character, "id">;
}

// Initialize express
export const app = express();

declare module "express-session" {
  interface SessionData {
    username: string;
  }
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// Session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const db = admin.firestore();

function generateAccessKey(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

const userHasAccess = (board: TierBoard, username: string): boolean => {
  return (
    board.creatorUsername === username || board.allowedUsers.includes(username)
  );
};

interface BoardParams {
  boardId: string;
}

interface CharacterParams extends BoardParams {
  characterId: string;
}

// Auth Handlers
const registerUser: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body as RegisterRequest;

    const userSnapshot = await db
      .collection("users")
      .where("username", "==", username)
      .get();

    if (!userSnapshot.empty) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userRef = db.collection("users").doc();
    const user: User = {
      username,
      passwordHash,
      createdAt: new Date(),
    };

    await userRef.set(user);

    if (req.session) {
      req.session.username = username;
    }

    res.status(201).json({ username });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

const loginUser: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body as LoginRequest;

    const userSnapshot = await db
      .collection("users")
      .where("username", "==", username)
      .get();

    if (userSnapshot.empty) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const userData = userSnapshot.docs[0].data() as User;

    const isValidPassword = await bcrypt.compare(
      password,
      userData.passwordHash,
    );
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (req.session) {
      req.session.username = username;
    }

    res.status(200).json({ username });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

const logoutUser: RequestHandler = (req, res): void => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
        return;
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    res.status(200).json({ message: "Already logged out" });
  }
};

const checkAuth: RequestHandler = (req, res, next): void => {
  if (!req.session?.username) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  req.headers["x-username"] = req.session.username;
  next();
};

const addCharacter: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, series, imageUrl } = req.body;
    const characterRef = db.collection("characters").doc();
    const characterData = { name, series, imageUrl };
    await characterRef.set(characterData);
    res.status(201).json({ id: characterRef.id, ...characterData });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

const getCharacters: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const characterSnapshot = await db.collection("characters").get();
    const characters = characterSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(characters);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const createBoard: RequestHandler = async (req, res): Promise<void> => {
  try {
    const {
      name,
      initialTags = [],
      creatorUsername,
    } = req.body as CreateBoardRequest;
    const boardRef = db.collection("tierBoards").doc();

    const board: TierBoard = {
      id: boardRef.id,
      name,
      accessKey: generateAccessKey(),
      creatorUsername,
      tagList: initialTags,
      characters: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      allowedUsers: [],
    };

    await boardRef.set(board);
    res.status(201).json(board);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

const addCharacterToBoard: RequestHandler<
  BoardParams,
  any,
  AddCharacterRequest
> = async (req, res): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { character } = req.body;

    const boardRef = db.collection("tierBoards").doc(boardId);
    const boardDoc = await boardRef.get();
    const board = boardDoc.data() as TierBoard;

    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    const characterId = admin.firestore().collection("characters").doc().id;
    const newCharacter = {
      ...character,
      id: characterId,
      rankings: [],
    };

    await boardRef.update({
      [`characters.${characterId}`]: newCharacter,
      updatedAt: new Date(),
    });

    res.status(201).json(newCharacter);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

const updateCharacterRanking: RequestHandler<
  CharacterParams,
  any,
  UpdateRankingRequest & { userId: string }
> = async (req, res): Promise<void> => {
  try {
    const { boardId, characterId } = req.params;
    const { tier, userId } = req.body;

    const boardRef = db.collection("tierBoards").doc(boardId);
    const boardDoc = await boardRef.get();
    const board = boardDoc.data() as TierBoard;

    if (!board || !board.characters[characterId]) {
      res.status(404).json({ error: "Board or character not found" });
      return;
    }

    const ranking = {
      userId,
      tier,
      timestamp: new Date(),
    };

    const character = board.characters[characterId];
    const existingRankingIndex = character.rankings.findIndex(
      (r) => r.userId === userId,
    );

    if (existingRankingIndex >= 0) {
      character.rankings[existingRankingIndex] = ranking;
    } else {
      character.rankings.push(ranking);
    }

    await boardRef.update({
      [`characters.${characterId}.rankings`]: character.rankings,
      updatedAt: new Date(),
    });

    res.status(200).json(character);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

const addTag: RequestHandler<BoardParams, any, AddTagRequest> = async (
  req,
  res,
): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { tag } = req.body;

    const boardRef = db.collection("tierBoards").doc(boardId);
    const boardDoc = await boardRef.get();
    const board = boardDoc.data() as TierBoard;

    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (!board.tagList.includes(tag)) {
      await boardRef.update({
        tagList: admin.firestore.FieldValue.arrayUnion(tag),
        updatedAt: new Date(),
      });
    }

    res.status(200).json({ tagList: [...board.tagList, tag] });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

const getBoard: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { boardId } = req.params;
    const username = req.headers["x-username"] as string;

    if (!username) {
      res.status(401).json({ error: "Username required" });
      return;
    }

    const boardRef = db.collection("tierBoards").doc(boardId);
    const boardDoc = await boardRef.get();
    const board = boardDoc.data() as TierBoard;

    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (!userHasAccess(board, username)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.status(200).json(board);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getBoardByAccessKey: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { accessKey } = req.params;
    const username = req.headers["x-username"] as string;

    if (!username) {
      res.status(401).json({ error: "Username required" });
      return;
    }

    const boardsSnapshot = await db
      .collection("tierBoards")
      .where("accessKey", "==", accessKey)
      .limit(1)
      .get();

    if (boardsSnapshot.empty) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    const boardRef = boardsSnapshot.docs[0].ref;
    const boardData = boardsSnapshot.docs[0].data() as TierBoard;

    if (
      boardData.creatorUsername !== username &&
      !boardData.allowedUsers?.includes(username)
    ) {
      await boardRef.update({
        allowedUsers: admin.firestore.FieldValue.arrayUnion(username),
      });

      boardData.allowedUsers = [...(boardData.allowedUsers || []), username];
    }

    const updatedBoard = {
      ...boardData,
      id: boardsSnapshot.docs[0].id,
    };

    res.status(200).json(updatedBoard);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getBoards: RequestHandler = async (req, res): Promise<void> => {
  try {
    const username = req.headers["x-username"] as string;
    if (!username) {
      res.status(401).json({ error: "Username required" });
      return;
    }

    const createdBoardsQuery = await db
      .collection("tierBoards")
      .where("creatorUsername", "==", username)
      .get();

    const sharedBoardsQuery = await db
      .collection("tierBoards")
      .where("allowedUsers", "array-contains", username)
      .get();

    const boards = [
      ...createdBoardsQuery.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      ...sharedBoardsQuery.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    ];

    res.status(200).json(boards);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const addUserToBoard: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { username } = req.body as AddUserToBoardRequest;
    const requestingUsername = req.headers["x-username"] as string;

    const boardRef = db.collection("tierBoards").doc(boardId);
    const board = await boardRef.get();
    const boardData = board.data() as TierBoard;

    if (!board.exists) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (boardData.creatorUsername !== requestingUsername) {
      res.status(403).json({ error: "Only the creator can add users" });
      return;
    }

    await boardRef.update({
      allowedUsers: admin.firestore.FieldValue.arrayUnion(username),
    });

    res.status(200).json({ message: "User added successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

// Auth routes (unprotected)
app.post("/auth/register", registerUser);
app.post("/auth/login", loginUser);
app.post("/auth/logout", logoutUser);

// Protected routes
app.use(checkAuth);
app.get("/auth/me", (req, res) => {
  if (!req.session?.username) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ username: req.session.username });
});

app.post("/characters", addCharacter);
app.get("/characters", getCharacters);
app.post("/boards", createBoard);
app.post("/boards/:boardId/characters", addCharacterToBoard);
app.post(
  "/boards/:boardId/characters/:characterId/ranking",
  updateCharacterRanking,
);
app.post("/boards/:boardId/tags", addTag);
app.get("/boards/:boardId", getBoard);
app.get("/boards", getBoards);
app.get("/boards/access/:accessKey", getBoardByAccessKey);
app.post("/boards/:boardId/users", addUserToBoard);
app.delete(
  "/boards/:boardId",
  async (req: Request<BoardParams>, res: Response): Promise<void> => {
    try {
      const { boardId } = req.params;
      await db.collection("tierBoards").doc(boardId).delete();
      res.status(200).json({ message: "Board deleted successfully" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errorMessage });
    }
  },
);

const PORT = process.env.PORT || 5003;
export const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
