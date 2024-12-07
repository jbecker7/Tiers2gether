import express, { Request, Response, RequestHandler } from 'express';
import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import serviceAccount from "./firebase/serviceAccountKey.json";
import cors from 'cors';

import { 
  TierBoard, 
  CreateBoardRequest, 
  AddCharacterRequest, 
  UpdateRankingRequest,
  AddTagRequest,
  UserProfile
} from "./types";

interface BoardParams {
  boardId: string;
}

interface CharacterParams extends BoardParams {
  characterId: string;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

const db = admin.firestore();

const app = express();
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

// Create board handler
const createBoard: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, initialTags = [] } = req.body as CreateBoardRequest;
    const boardRef = db.collection("tierBoards").doc();
    
    const board: TierBoard = {
      id: boardRef.id,
      name,
      tagList: initialTags,
      characters: {},
      createdAt: new Date(),
      updatedAt: new Date()
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

// Get board handler
const getBoard: RequestHandler<BoardParams> = async (req, res): Promise<void> => {
  try {
    const { boardId } = req.params;
    const boardRef = db.collection("tierBoards").doc(boardId);
    const boardDoc = await boardRef.get();
    const board = boardDoc.data() as TierBoard;
    
    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }
    
    res.status(200).json(board);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

const getBoards: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const boardsSnapshot = await db.collection("tierBoards").get();
    const boards = boardsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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


// Route definitions
app.post("/characters", addCharacter);
app.get("/characters", getCharacters);
app.post("/boards", createBoard);
app.post("/boards/:boardId/characters", addCharacterToBoard);
app.post("/boards/:boardId/characters/:characterId/ranking", updateCharacterRanking);
app.post("/boards/:boardId/tags", addTag);
app.get("/boards/:boardId", getBoard);
app.get("/boards", getBoards);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});