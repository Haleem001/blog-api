const request = require('supertest');
const app = require('../app');

describe('Server 404 Handler', () => {
    it('should return 404 JSON for unknown routes', async () => {
        const response = await request(app)
            .get('/unknown-route')
            .expect(404);

        expect(response.body.status).toBe('fail');
        expect(response.body.message).toContain("Can't find /unknown-route on this server!");
    });

    it('should return 404 JSON for unknown POST routes', async () => {
        const response = await request(app)
            .post('/health') // Assuming POST /health is not defined
            .expect(404);

        expect(response.body.status).toBe('fail');
        expect(response.body.message).toContain("Can't find /health on this server!");
    });
});
