import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import TierBoardComponent from "../TierBoard";
import "@testing-library/jest-dom";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("TierBoard Component", () => {
  const mockBoard = {
    id: "board1",
    name: "Test Board",
    creatorUsername: "testuser",
    tagList: ["tv", "anime"],
    characters: {
      char1: {
        id: "char1",
        name: "Test Character",
        series: "Test Series",
        imageUrl: "test.jpg",
        tags: ["tv"],
        rankings: [{ userId: "testuser", tier: "S" }],
      },
    },
    accessKey: "test-key",
  };

  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();
  });

  test("loads board data on mount", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBoard });
    render(<TierBoardComponent boardId="board1" userId="testuser" />);
    await waitFor(() => {
      expect(screen.getByText(mockBoard.name)).toBeInTheDocument();
    });
  });

  test("displays character in correct tier", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBoard });
    render(<TierBoardComponent boardId="board1" userId="testuser" />);
    await waitFor(() => {
      expect(screen.getByText("Test Character")).toBeInTheDocument();
    });
  });

  test("handles tag management", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBoard });
    mockedAxios.post.mockResolvedValueOnce({
      data: { ...mockBoard, tagList: [...mockBoard.tagList, "movie"] },
    });

    render(<TierBoardComponent boardId="board1" userId="testuser" />);

    // Click add tag button
    const addTagButton = await screen.findByText("Add Tag");
    fireEvent.click(addTagButton);

    // Fill out the form
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    const tagInput = screen.getByRole("textbox");
    await userEvent.type(tagInput, "movie");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Add Tag" });
    fireEvent.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  test("handles share functionality", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBoard });
    const mockClipboard = { writeText: jest.fn() };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<TierBoardComponent boardId="board1" userId="testuser" />);

    // Wait for and click share button
    const shareButton = await screen.findByText(/share board/i);
    fireEvent.click(shareButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Click copy button and verify clipboard
    const copyButton = screen.getByText(/copy/i);
    fireEvent.click(copyButton);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockBoard.accessKey);
  });
});
