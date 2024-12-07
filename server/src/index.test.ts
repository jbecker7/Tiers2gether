import request from 'supertest';
import { app } from './index';
import { server } from './index'

describe('API Tests', () => {
  test('GET /boards returns boards', async () => {
    const response = await request(app).get('/boards');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Can create and retrieve a board', async () => {
    // Create board
    const createResponse = await request(app)
      .post('/boards')
      .send({
        name: 'Test Board',
        initialTags: ['test']
      });
    
    expect(createResponse.status).toBe(201); // Note: your endpoint returns 201
    expect(createResponse.body.name).toBe('Test Board');
    
    // Get the created board
    const boardId = createResponse.body.id;
    const getResponse = await request(app).get(`/boards/${boardId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.name).toBe('Test Board');
  });

  test('Can add character to board', async () => {
    // First create a board
    const boardResponse = await request(app)
      .post('/boards')
      .send({
        name: 'Character Test Board',
        initialTags: ['test']
      });
    
    const boardId = boardResponse.body.id;

    // Add character
    const characterResponse = await request(app)
      .post(`/boards/${boardId}/characters`)
      .send({
        character: {  // Note: your endpoint expects a character object
          name: 'Test Character',
          series: 'Test Series',
          imageUrl: 'https://example.com/test.jpg',
          tags: ['test']
        }
      });
    
    expect(characterResponse.status).toBe(201);
    expect(characterResponse.body.name).toBe('Test Character');
  });

  test('Can update character ranking', async () => {
    // Create board and character
    const boardResponse = await request(app)
      .post('/boards')
      .send({
        name: 'Ranking Test Board',
        initialTags: ['test']
      });
    
    const boardId = boardResponse.body.id;
    
    const characterResponse = await request(app)
      .post(`/boards/${boardId}/characters`)
      .send({
        character: {
          name: 'Ranking Test Character',
          series: 'Test Series',
          imageUrl: 'https://example.com/test.jpg',
          tags: ['test']
        }
      });
    
    const characterId = characterResponse.body.id;

    // Update ranking
    const rankingResponse = await request(app)
      .post(`/boards/${boardId}/characters/${characterId}/ranking`)  // Note: using POST not PUT
      .send({
        userId: 'testUser',
        tier: 'S'
      });
    
    expect(rankingResponse.status).toBe(200);

    // Verify ranking was updated
    const boardGet = await request(app).get(`/boards/${boardId}`);
    const character = boardGet.body.characters[characterId];
    expect(character.rankings[0].tier).toBe('S');
  });

  afterAll((done) => {
    server.close(done);
  });
});