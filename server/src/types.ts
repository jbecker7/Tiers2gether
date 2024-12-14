export interface CharacterRanking {
  userId: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  timestamp: Date;
}

export interface Character {
  id?: string;
  name: string;
  series: string;
  imageUrl: string;
  rankings: CharacterRanking[];
  tags: string[];
}

export interface BoardCharacter extends Character {
  rankings: CharacterRanking[];
}

export interface TierBoard {
  id: string;
  name: string;
  tagList: string[];
  characters: {
    [characterId: string]: BoardCharacter;
  };
  createdAt: Date;
  updatedAt: Date;
  creatorUsername: string;
  accessKey: string;
  allowedUsers: string[];
}

export interface UserProfile {
  userId: string;
  email: string;
  tierBoards: string[];
}

export interface CreateBoardRequest {
  name: string;
  initialTags?: string[];
  creatorUsername: string;
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

export interface CreateBoardRequest {
  name: string;
  initialTags?: string[];
  creatorUsername: string;
}

export interface AddUserToBoardRequest {
  username: string;
}