# Tiers2gether

## Project Description

Tiers2gether is a collaborative tier list maker that allows users to create, share, and collectively rank characters or items. Users can create boards, invite others, and see real-time rankings across different tiers (S, A, B, C, D).

### Team Members and Contributions

- Jonathan Becker (jbecke14) - Full Stack Development, Firebase Integration, Testing
- Estimated completion time: ~40 hours

### Repository

[GitHub Repository Link](https://github.com/jbecker7/Tiers2gether)

## Resources

### Online Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Documentation](https://react.dev/)
- [React DnD Documentation](https://react-dnd.github.io/react-dnd/about)

## Design Choices

### Architecture

1. **Frontend (React + TypeScript)**

   - React for component-based UI
   - TypeScript for client logic
   - React DnD for drag-and-drop functionality
   - Jest for E2E testing
   - Tailwind CSS for styling

2. **Backend (Express + Firebase)**
   - Express.js TypeScript server
   - Firebase Firestore database
   - Express-session for authentication
   - bcrypt for password hashing

### Key Components

1. **Authentication System**

   - Session-based auth with HTTP-only cookies
   - Password hashing with bcrypt
   - Protected route middleware

2. **Board Management**

   - Real-time tier list updates
   - Collaborative ranking system
   - Access control via creator/allowed users

3. **Data Structures**

```typescript
interface TierBoard {
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
```

## Tests

### Authentication Tests

1. `shows login screen when not authenticated`

   - Verifies initial auth state
   - Checks for login form presence

2. `validates form inputs on submit`

   - Tests required fields
   - Validates input constraints

3. `handles successful login`

   - Tests credential submission
   - Verifies successful auth state
   - Checks session creation

4. `handles failed login`

   - Tests invalid credentials
   - Verifies error messages
   - Checks auth state remains false

5. `handles logout`
   - Tests session cleanup
   - Verifies state reset
   - Checks cookie removal

#### Board Management Tests

6. `creates default board if no boards exist`

   - Tests automatic board creation
   - Verifies default settings
   - Checks Firebase integration

7. `handles board creation`

   - Tests manual board creation
   - Verifies board properties
   - Validates API calls

8. `handles board deletion with multiple boards`
   - Tests deletion logic
   - Verifies cleanup
   - Checks remaining boards state

#### Loading States

9. `shows loading state when authenticated`
   - Tests loading indicators
   - Verifies async state handling

### TierBoard Component Tests

10. `loads board data on mount`

    - Verifies initial board loading
    - Checks board name rendering
    - Tests API integration

11. `displays character in correct tier`

    - Validates character placement
    - Ensures correct tier assignment
    - Tests character name rendering

12. `handles tag management`

    - Tests tag addition functionality
    - Verifies dialog interactions
    - Validates API calls for tag updates
    - Checks UI updates after tag addition

13. `handles share functionality`
    - Tests share board dialog
    - Validates clipboard integration
    - Verifies access key copying
    - Tests UI feedback for sharing

## Running the Application

### Prerequisites

- Node.js >= 16
- npm
- Firebase credentials

### Setup

1. Clone the repository

```bash
git clone https://github.com/jbecker7/Tiers2gether
cd tiers2gether
```

2. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. Create Firebase config

- Add `serviceAccountKey.json` to `/server/firebase/`
- Set up environment variables

4. Start development servers

```bash
npm run dev
```

### Running Tests

```bash
cd client
npx jest
```

## Future Improvements

1. Feature: narrow by tags
2. Testing: more comprehensive unit testing for edge cases
