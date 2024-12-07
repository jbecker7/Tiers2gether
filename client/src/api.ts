// api.ts
import axios, { AxiosError } from 'axios';
import { 
  TierBoard, 
  Character, 
  CreateBoardRequest, 
  // UpdateRankingRequest 
} from './types';

const BASE_URL = 'http://localhost:5003';

// Custom error handling, might make it more user friendly later on, rn mainly for me
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      throw new Error(`API Error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
    } else if (axiosError.request) {
      throw new Error('No response received from server. Please check if the server is running.');
    }
  }
  throw error;
};

export const fetchCharacters = async (): Promise<Character[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/characters`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const addCharacter = async (characterData: {
  name: string;
  series: string;
  imageUrl: string;
  tags: string[];
}): Promise<Character> => {
  try {
    const response = await axios.post(`${BASE_URL}/characters`, characterData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createTierBoard = async (data: CreateBoardRequest): Promise<TierBoard> => {
  try {
    const response = await axios.post(`${BASE_URL}/boards`, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getTierBoard = async (boardId: string): Promise<TierBoard> => {
  try {
    const response = await axios.get(`${BASE_URL}/boards/${boardId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const addCharacterToBoard = async (
  boardId: string, 
  character: Omit<Character, 'id'>
): Promise<Character> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/boards/${boardId}/characters`, 
      { 
        character: {
          ...character,
          rankings: [] // Initialize empty rankings array
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding character to board:', error);
    throw error;
  }
};

export const updateCharacterRanking = async (
  boardId: string,
  characterId: string,
  tier: 'S' | 'A' | 'B' | 'C' | 'D',
  userId: string
): Promise<Character> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/boards/${boardId}/characters/${characterId}/ranking`,
      { 
        tier,
        userId // Include userId in the request
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const addTagToBoard = async (boardId: string, tag: string): Promise<{ tagList: string[] }> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/boards/${boardId}/tags`,
      { tag }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const getBoards = async (): Promise<TierBoard[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/boards`);
    return response.data;
  } catch (error) {
    console.error('Error fetching boards:', error);
    throw error;
  }
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/boards/${boardId}`);
  } catch (error) {
    console.error('Error deleting board:', error);
    throw error;
  }
};

export const updateBoard = async (boardId: string, updates: { name: string }): Promise<TierBoard> => {
  try {
    const response = await axios.patch(`${BASE_URL}/boards/${boardId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating board:', error);
    throw error;
  }
};
