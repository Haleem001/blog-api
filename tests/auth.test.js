const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');

// Test database connection string
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/blog-api-test';

beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
    // Cleanup and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
});

describe('Auth Endpoints', () => {
    describe('POST /api/auth/signup', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.data.user).toHaveProperty('_id');
            expect(response.body.data.user.first_name).toBe('John');
            expect(response.body.data.user.last_name).toBe('Doe');
            expect(response.body.data.user.email).toBe('john.doe@example.com');
            expect(response.body.data.user.password).not.toBe('password123'); // Password should be hashed
        });

        it('should fail to create user with missing fields', async () => {
            const userData = {
                first_name: 'John',
                email: 'john@example.com'
                // Missing last_name and password
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(500);
        });

        it('should fail to create user with duplicate email', async () => {
            const userData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            // Create first user
            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            // Try to create duplicate
            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(500);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user before each login test
            await request(app)
                .post('/api/auth/signup')
                .send({
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: 'jane.smith@example.com',
                    password: 'password123'
                });
        });

        it('should login user with valid credentials', async () => {
            const loginData = {
                email: 'jane.smith@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('token');
            expect(typeof response.body.data.token).toBe('string');
        });

        it('should fail to login with incorrect password', async () => {
            const loginData = {
                email: 'jane.smith@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.status).toBe('fail');
        });

        it('should fail to login with non-existent email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.status).toBe('fail');
        });

        it('should return a token that expires in 1 hour', async () => {
            const loginData = {
                email: 'jane.smith@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            const token = response.body.data.token;
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(token);
            
            // Check that token expires in 1 hour (3600 seconds)
            const tokenLifetime = decoded.exp - decoded.iat;
            expect(tokenLifetime).toBe(3600);
        });
    });
});
