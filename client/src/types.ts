import type { 
  DroppableProvided, 
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult 
} from 'react-beautiful-dnd';

export interface DndProvided {
  droppable: {
    provided: DroppableProvided;
    snapshot: DroppableStateSnapshot;
  };
  draggable: {
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
  };
}

export interface Character {
  id?: string;
  name: string;
  series: string;
  imageUrl: string;
  tags: string[];
}

// Individual ranking by a user
export interface CharacterRanking {
  userId: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  timestamp: Date;
}

// Character with its rankings in a specific board
export interface BoardCharacter extends Character {
  rankings: CharacterRanking[];
}

// Structure for a tier board
export interface TierBoard {
  id: string;
  name: string;
  tagList: string[];
  characters: {
    [characterId: string]: BoardCharacter;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User profile structure
export interface UserProfile {
  userId: string;
  email: string;
  tierBoards: string[]; // Array of board IDs the user is part of
}

// Request types for API endpoints
export interface CreateBoardRequest {
  name: string;
  initialTags?: string[];
}

export interface AddCharacterRequest {
  boardId: string;
  character: Omit<Character, 'id'>;
}

export interface UpdateRankingRequest {
  boardId: string;
  characterId: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface AddTagRequest {
  boardId: string;
  tag: string;
}