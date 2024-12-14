import express, { Request, Response, RequestHandler } from 'express';
import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import cors from 'cors';
import serviceAccount from "./firebase/serviceAccountKey.json";

import { 
  TierBoard, 
  CreateBoardRequest, 
  AddCharacterRequest, 
  UpdateRankingRequest,
  AddTagRequest,
  UserProfile,
  AddUserToBoardRequest
} from "./types";

function generateAccessKey(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

const userHasAccess = (board: TierBoard, username: string): boolean => {
  return board.creatorUsername === username || board.allowedUsers.includes(username);
};

interface BoardParams {
  boardId: string;
}

interface CharacterParams extends BoardParams {
  characterId: string;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const db = admin.firestore();

export const app = express();
app.use(express.json());
app.use(cors());

// Add character handler (each time we add a new character)
const addCharacter: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, series, imageUrl } = req.body;
    const characterRef = db.collection("characters").doc();
    const characterData = { name, series, imageUrl };
    await characterRef.set(characterData);
    res.status(201).json({ id: characterRef.id, ...characterData });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

// Get characters handler (each time we load up a board)
const getCharacters: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const characterSnapshot = await db.collection("characters").get();
    const characters = characterSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(characters);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const createBoard: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, initialTags = [], creatorUsername } = req.body as CreateBoardRequest;
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
      allowedUsers: []  // Initialize empty array of allowed users
    };
    
    await boardRef.set(board);
    res.status(201).json(board);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};


// Add character to board handler
const addCharacterToBoard: RequestHandler<BoardParams, any, AddCharacterRequest> = async (req, res): Promise<void> => {
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
      rankings: []
    };
    
    await boardRef.update({
      [`characters.${characterId}`]: newCharacter,
      updatedAt: new Date()
    });
    
    res.status(201).json(newCharacter);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

// Update character ranking handler
const updateCharacterRanking: RequestHandler<CharacterParams, any, UpdateRankingRequest & { userId: string }> = async (req, res): Promise<void> => {
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
      timestamp: new Date()
    };
    
    const character = board.characters[characterId];
    const existingRankingIndex = character.rankings.findIndex(r => r.userId === userId);
    
    if (existingRankingIndex >= 0) {
      character.rankings[existingRankingIndex] = ranking;
    } else {
      character.rankings.push(ranking);
    }
    
    await boardRef.update({
      [`characters.${characterId}.rankings`]: character.rankings,
      updatedAt: new Date()
    });
    
    res.status(200).json(character);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

// Add tag handler
const addTag: RequestHandler<BoardParams, any, AddTagRequest> = async (req, res): Promise<void> => {
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
        updatedAt: new Date()
      });
    }
    
    res.status(200).json({ tagList: [...board.tagList, tag] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

const getBoard: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { boardId } = req.params;
    const username = req.headers['x-username'] as string;
    
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getBoardByAccessKey: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { accessKey } = req.params;
    
    const boardsSnapshot = await db.collection("tierBoards")
      .where("accessKey", "==", accessKey)
      .limit(1)
      .get();

    if (boardsSnapshot.empty) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    const board = {
      id: boardsSnapshot.docs[0].id,
      ...boardsSnapshot.docs[0].data()
    };
    
    res.status(200).json(board);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getBoards: RequestHandler = async (req, res): Promise<void> => {
  try {
    const username = req.headers['x-username'] as string;
    if (!username) {
      res.status(401).json({ error: "Username required" });
      return;
    }

    // Get boards where user is creator
    const createdBoardsQuery = await db.collection("tierBoards")
      .where("creatorUsername", "==", username)
      .get();

    // Get boards where user is in allowedUsers
    const sharedBoardsQuery = await db.collection("tierBoards")
      .where("allowedUsers", "array-contains", username)
      .get();

    // Combine both sets of boards
    const boards = [
      ...createdBoardsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })),
      ...sharedBoardsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    ];

    res.status(200).json(boards);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

app.delete("/boards/:boardId", async (req: Request<BoardParams>, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    await db.collection("tierBoards").doc(boardId).delete();
    res.status(200).json({ message: "Board deleted successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});
const addUserToBoard: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { username } = req.body as AddUserToBoardRequest;
    const requestingUsername = req.headers['x-username'] as string;

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
      allowedUsers: admin.firestore.FieldValue.arrayUnion(username)
    });

    res.status(200).json({ message: "User added successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

// Route definitions
app.post("/characters", addCharacter);
app.get("/characters", getCharacters);
app.post("/boards", createBoard);
app.post("/boards/:boardId/characters", addCharacterToBoard);
app.post("/boards/:boardId/characters/:characterId/ranking", updateCharacterRanking);
app.post("/boards/:boardId/tags", addTag);
app.get("/boards/:boardId", getBoard);
app.get("/boards", getBoards);
app.get("/boards/access/:accessKey", getBoardByAccessKey);
app.post("/boards/:boardId/users", addUserToBoard);

const PORT = process.env.PORT || 5003;
export const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;