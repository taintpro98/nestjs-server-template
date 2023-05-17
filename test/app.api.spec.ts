import request from 'supertest';
import { HOST, PORT } from './helpers';

const API_DOMAIN = `${HOST}:${PORT}`;

describe('app TEST', () => {
  describe('GET /api/v1', () => {
    it('Health check', async () => {
      const response = await request(API_DOMAIN).get('/api/v1');
      expect(response.status).toBe(200);
    });
  });
});
