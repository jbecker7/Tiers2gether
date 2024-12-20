import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import App from "../App";
import "@testing-library/jest-dom";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("App", () => {
  const mockBoard = {
    id: "board1",
    name: "Test Board",
    creatorUsername: "testuser",
    tagList: ["tv", "anime"],
    characters: {},
    accessKey: "test-key",
  };

  const mockCredentials = {
    username: "testuser",
    password: "Test123!",
  };

  beforeEach(() => {
    mockedAxios.post.mockClear();
    mockedAxios.get.mockClear();
    mockedAxios.delete.mockClear();
    localStorage.clear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setupAuthenticatedState = () => {
    localStorage.setItem("authUser", mockCredentials.username);
    mockedAxios.get
      .mockResolvedValueOnce({ data: { username: mockCredentials.username } })
      .mockResolvedValueOnce({ data: [mockBoard] })
      .mockResolvedValue({ data: mockBoard });
  };

  describe("Authentication", () => {
    test("shows login screen when not authenticated", () => {
      render(<App />);
      expect(
        screen.getByRole("heading", { name: /login/i }),
      ).toBeInTheDocument();
    });

    test("validates form inputs on submit", async () => {
      render(<App />);
      const submitButton = screen.getByRole("button", { name: /login/i });
      fireEvent.click(submitButton);

      const usernameInput = screen.getByPlaceholderText(/enter username/i);
      const passwordInput = screen.getByPlaceholderText(/enter password/i);
      expect(usernameInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute("required");
    });

    test("handles successful login", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { username: mockCredentials.username },
      });
      mockedAxios.get
        .mockResolvedValueOnce({ data: { username: mockCredentials.username } })
        .mockResolvedValueOnce({ data: [mockBoard] })
        .mockResolvedValue({ data: mockBoard });

      render(<App />);

      await userEvent.type(
        screen.getByPlaceholderText(/enter username/i),
        mockCredentials.username,
      );
      await userEvent.type(
        screen.getByPlaceholderText(/enter password/i),
        mockCredentials.password,
      );
      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText(/logged in as:/i)).toBeInTheDocument();
      });
    });

    test("handles failed login", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: "Invalid credentials" } },
      });

      render(<App />);

      await userEvent.type(
        screen.getByPlaceholderText(/enter username/i),
        mockCredentials.username,
      );
      await userEvent.type(
        screen.getByPlaceholderText(/enter password/i),
        mockCredentials.password,
      );
      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
      });
    });

    test("handles logout", async () => {
      setupAuthenticatedState();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/logged in as:/i)).toBeInTheDocument();
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { message: "Logged out" },
      });
      const logoutButton = screen.getByRole("button", { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /login/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Board Management", () => {
    beforeEach(() => {
      setupAuthenticatedState();
    });

    test("creates default board if no boards exist", async () => {
      const defaultBoard = {
        ...mockBoard,
        name: "Default Tier Board",
      };

      mockedAxios.get.mockReset();
      mockedAxios.get
        .mockResolvedValueOnce({ data: { username: mockCredentials.username } })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: defaultBoard });

      mockedAxios.post.mockResolvedValueOnce({ data: defaultBoard });

      render(<App />);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5003/boards",
          expect.objectContaining({
            name: "Default Tier Board",
            initialTags: ["tv", "anime"],
            creatorUsername: mockCredentials.username,
          }),
          expect.any(Object),
        );
      });
    });

    test("handles board creation", async () => {
      const newBoard = {
        ...mockBoard,
        id: "board2",
        name: "New Board",
      };

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/new board name/i),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/new board name/i);
      await userEvent.type(input, "New Board");

      mockedAxios.post.mockResolvedValueOnce({ data: newBoard });
      fireEvent.click(screen.getByRole("button", { name: /create board/i }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });

    test("handles board deletion with multiple boards", async () => {
      const secondBoard = { ...mockBoard, id: "board2", name: "Second Board" };

      mockedAxios.get.mockReset();
      mockedAxios.get
        .mockResolvedValueOnce({ data: { username: mockCredentials.username } })
        .mockResolvedValueOnce({ data: [mockBoard, secondBoard] })
        .mockResolvedValue({ data: mockBoard });

      render(<App />);

      await waitFor(() => {
        expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(
          2,
        );
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      mockedAxios.delete.mockResolvedValueOnce({
        data: { message: "Success" },
      });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalled();
      });
    });
  });

  describe("Loading States", () => {
    test("shows loading state when authenticated", () => {
      localStorage.setItem("authUser", mockCredentials.username);
      mockedAxios.get.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<App />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });
});
