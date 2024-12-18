import axios, { AxiosError } from "axios";
import { TierBoard, Character, CreateBoardRequest } from "./types";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5003";
const BASE_URL = "http://localhost:5003";

// Helper to get headers with username
const getHeaders = () => {
  const username = localStorage.getItem("username");
  return {
    "Content-Type": "application/json",
    "X-Username": username || "",
  };
};

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      throw new Error(
        `API Error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`,
      );
    } else if (axiosError.request) {
      throw new Error(
        "No response received from server. Please check if the server is running.",
      );
    }
  }
  throw error;
};

export const fetchCharacters = async (): Promise<Character[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/characters`, {
      headers: getHeaders(),
    });
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
    const response = await axios.post(`${BASE_URL}/characters`, characterData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createTierBoard = async (
  data: CreateBoardRequest,
): Promise<TierBoard> => {
  try {
    const response = await axios.post(`${BASE_URL}/boards`, data, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getTierBoard = async (boardId: string): Promise<TierBoard> => {
  try {
    const response = await axios.get(`${BASE_URL}/boards/${boardId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const addCharacterToBoard = async (
  boardId: string,
  character: Omit<Character, "id">,
): Promise<Character> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/boards/${boardId}/characters`,
      {
        character: {
          ...character,
          rankings: [],
        },
      },
      { headers: getHeaders() },
    );
    return response.data;
  } catch (error) {
    console.error("Error adding character to board:", error);
    throw error;
  }
};

export const updateCharacterRanking = async (
  boardId: string,
  characterId: string,
  tier: "S" | "A" | "B" | "C" | "D",
  userId: string,
): Promise<Character> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/boards/${boardId}/characters/${characterId}/ranking`,
      {
        tier,
        userId,
      },
      { headers: getHeaders() },
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const addTagToBoard = async (
  boardId: string,
  tag: string,
): Promise<{ tagList: string[] }> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/boards/${boardId}/tags`,
      { tag },
      { headers: getHeaders() },
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getBoards = async (): Promise<TierBoard[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/boards`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching boards:", error);
    throw error;
  }
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/boards/${boardId}`, {
      headers: getHeaders(),
    });
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
};

export const updateBoard = async (
  boardId: string,
  updates: { name: string },
): Promise<TierBoard> => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/boards/${boardId}`,
      updates,
      { headers: getHeaders() },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating board:", error);
    throw error;
  }
};

// New functions for board access
export const addUserToBoard = async (
  boardId: string,
  username: string,
): Promise<void> => {
  try {
    await axios.post(
      `${BASE_URL}/boards/${boardId}/users`,
      { username },
      { headers: getHeaders() },
    );
  } catch (error) {
    console.error("Error adding user to board:", error);
    throw error;
  }
};

export const getBoardByAccessKey = async (
  accessKey: string,
): Promise<TierBoard> => {
  try {
    const response = await axios.get(`${BASE_URL}/boards/access/${accessKey}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching board by access key:", error);
    throw error;
  }
};
