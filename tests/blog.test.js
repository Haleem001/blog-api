const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const Blog = require('../models/blog.model');

// Test database connection string
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/blog-api-test';

let authToken;
let userId;
let anotherAuthToken;
let anotherUserId;

beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
    // Cleanup and close connection
    await User.deleteMany({});
    await Blog.deleteMany({});
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await Blog.deleteMany({});

    // Create a test user and get token
    const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            password: 'password123'
        });

    userId = signupResponse.body.data.user._id;

    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'test@example.com',
            password: 'password123'
        });

    authToken = loginResponse.body.data.token;

    // Create another test user
    const anotherSignupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
            first_name: 'Another',
            last_name: 'User',
            email: 'another@example.com',
            password: 'password123'
        });

    anotherUserId = anotherSignupResponse.body.data.user._id;

    const anotherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'another@example.com',
            password: 'password123'
        });

    anotherAuthToken = anotherLoginResponse.body.data.token;
});

describe('Blog Endpoints', () => {
    describe('POST /api/blogs', () => {
        it('should create a blog in draft state by default', async () => {
            const blogData = {
                title: 'My First Blog',
                description: 'This is a test blog',
                body: 'This is the body of the blog post with enough content to calculate reading time.',
                tags: ['test', 'demo']
            };

            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(blogData)
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.data.title).toBe('My First Blog');
            expect(response.body.data.state).toBe('draft');
            expect(response.body.data.author).toBe(userId);
            expect(response.body.data).toHaveProperty('reading_time');
            expect(response.body.data.read_count).toBe(0);
        });

        it('should fail to create blog without authentication', async () => {
            const blogData = {
                title: 'Unauthorized Blog',
                description: 'Test',
                body: 'Body content',
                tags: ['test']
            };

            await request(app)
                .post('/api/blogs')
                .send(blogData)
                .expect(401);
        });

        it('should create blog with all required fields', async () => {
            const blogData = {
                title: 'Complete Blog',
                description: 'A complete blog post',
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50),
                tags: ['complete', 'test']
            };

            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(blogData)
                .expect(201);

            expect(response.body.data).toHaveProperty('title');
            expect(response.body.data).toHaveProperty('description');
            expect(response.body.data).toHaveProperty('body');
            expect(response.body.data).toHaveProperty('tags');
            expect(response.body.data).toHaveProperty('author');
            expect(response.body.data).toHaveProperty('timestamp');
            expect(response.body.data).toHaveProperty('state');
            expect(response.body.data).toHaveProperty('read_count');
            expect(response.body.data).toHaveProperty('reading_time');
        });
    });

    describe('GET /api/blogs', () => {
        beforeEach(async () => {
            // Create some test blogs
            await Blog.create([
                {
                    title: 'Published Blog 1',
                    description: 'First published blog',
                    body: 'Content for first blog',
                    state: 'published',
                    author: userId,
                    tags: ['nodejs', 'testing']
                },
                {
                    title: 'Published Blog 2',
                    description: 'Second published blog',
                    body: 'Content for second blog',
                    state: 'published',
                    author: userId,
                    tags: ['javascript']
                },
                {
                    title: 'Draft Blog',
                    description: 'This is a draft',
                    body: 'Draft content',
                    state: 'draft',
                    author: userId,
                    tags: ['draft']
                }
            ]);
        });

        it('should get all published blogs without authentication', async () => {
            const response = await request(app)
                .get('/api/blogs')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.length).toBe(2); // Only published blogs
            expect(response.body.data.every(blog => blog.state === 'published')).toBe(true);
        });

        it('should paginate results with default 20 per page', async () => {
            const response = await request(app)
                .get('/api/blogs')
                .expect(200);

            expect(response.body.limit).toBe(20);
            expect(response.body.page).toBe(1);
            expect(response.body).toHaveProperty('total');
        });

        it('should support custom pagination', async () => {
            const response = await request(app)
                .get('/api/blogs?page=1&limit=1')
                .expect(200);

            expect(response.body.limit).toBe(1);
            expect(response.body.page).toBe(1);
            expect(response.body.data.length).toBeLessThanOrEqual(1);
        });

        it('should search by title', async () => {
            const response = await request(app)
                .get('/api/blogs?search=Published Blog 1')
                .expect(200);

            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].title).toContain('Published Blog 1');
        });

        it('should search by tags', async () => {
            const response = await request(app)
                .get('/api/blogs?search=nodejs')
                .expect(200);

            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].tags).toContain('nodejs');
        });

        it('should search by author name', async () => {
            const response = await request(app)
                .get('/api/blogs?search=Test')
                .expect(200);

            expect(response.body.status).toBe('success');
        });

        it('should order by read_count', async () => {
            // Update one blog to have higher read count
            const blog = await Blog.findOne({ state: 'published' });
            blog.read_count = 10;
            await blog.save();

            const response = await request(app)
                .get('/api/blogs?orderBy=read_count')
                .expect(200);

            expect(response.body.status).toBe('success');
            if (response.body.data.length > 1) {
                expect(response.body.data[0].read_count).toBeGreaterThanOrEqual(
                    response.body.data[1].read_count
                );
            }
        });

        it('should order by reading_time', async () => {
            const response = await request(app)
                .get('/api/blogs?orderBy=reading_time')
                .expect(200);

            expect(response.body.status).toBe('success');
        });

        it('should order by timestamp', async () => {
            const response = await request(app)
                .get('/api/blogs?orderBy=timestamp')
                .expect(200);

            expect(response.body.status).toBe('success');
        });

        it('should populate author information', async () => {
            const response = await request(app)
                .get('/api/blogs')
                .expect(200);

            expect(response.body.data[0].author).toHaveProperty('first_name');
            expect(response.body.data[0].author).toHaveProperty('last_name');
            expect(response.body.data[0].author).toHaveProperty('email');
        });
    });

    describe('GET /api/blogs/:id', () => {
        let publishedBlogId;
        let draftBlogId;

        beforeEach(async () => {
            const publishedBlog = await Blog.create({
                title: 'Published Test Blog',
                description: 'Test description',
                body: 'Test body content',
                state: 'published',
                author: userId,
                tags: ['test']
            });
            publishedBlogId = publishedBlog._id;

            const draftBlog = await Blog.create({
                title: 'Draft Test Blog',
                description: 'Draft description',
                body: 'Draft body content',
                state: 'draft',
                author: userId,
                tags: ['draft']
            });
            draftBlogId = draftBlog._id;
        });

        it('should get a published blog by id', async () => {
            const response = await request(app)
                .get(`/api/blogs/${publishedBlogId}`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.title).toBe('Published Test Blog');
            expect(response.body.data.author).toHaveProperty('first_name');
        });

        it('should increment read_count when blog is viewed', async () => {
            const initialResponse = await request(app)
                .get(`/api/blogs/${publishedBlogId}`)
                .expect(200);

            const initialReadCount = initialResponse.body.data.read_count;

            const secondResponse = await request(app)
                .get(`/api/blogs/${publishedBlogId}`)
                .expect(200);

            expect(secondResponse.body.data.read_count).toBe(initialReadCount + 1);
        });

        it('should not return draft blogs', async () => {
            await request(app)
                .get(`/api/blogs/${draftBlogId}`)
                .expect(404);
        });

        it('should return 404 for non-existent blog', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await request(app)
                .get(`/api/blogs/${fakeId}`)
                .expect(404);
        });
    });

    describe('GET /api/blogs/me', () => {
        beforeEach(async () => {
            // Create blogs for the authenticated user
            await Blog.create([
                {
                    title: 'My Draft Blog',
                    description: 'Draft',
                    body: 'Content',
                    state: 'draft',
                    author: userId,
                    tags: ['draft']
                },
                {
                    title: 'My Published Blog',
                    description: 'Published',
                    body: 'Content',
                    state: 'published',
                    author: userId,
                    tags: ['published']
                }
            ]);
        });

        it('should get all blogs owned by authenticated user', async () => {
            const response = await request(app)
                .get('/api/blogs/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.length).toBe(2);
        });

        it('should fail without authentication', async () => {
            await request(app)
                .get('/api/blogs/me')
                .expect(401);
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/blogs/me?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.page).toBe(1);
            expect(response.body.limit).toBe(1);
            expect(response.body).toHaveProperty('total');
        });

        it('should filter by state - draft', async () => {
            const response = await request(app)
                .get('/api/blogs/me?state=draft')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.data.every(blog => blog.state === 'draft')).toBe(true);
            expect(response.body.data.length).toBe(1);
        });

        it('should filter by state - published', async () => {
            const response = await request(app)
                .get('/api/blogs/me?state=published')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.data.every(blog => blog.state === 'published')).toBe(true);
            expect(response.body.data.length).toBe(1);
        });
    });

    describe('PATCH /api/blogs/:id', () => {
        let blogId;

        beforeEach(async () => {
            const blog = await Blog.create({
                title: 'Original Title',
                description: 'Original description',
                body: 'Original body',
                state: 'draft',
                author: userId,
                tags: ['original']
            });
            blogId = blog._id;
        });

        it('should update blog by owner', async () => {
            const updateData = {
                title: 'Updated Title',
                description: 'Updated description',
                body: 'Updated body',
                state: 'published'
            };

            const response = await request(app)
                .patch(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.title).toBe('Updated Title');
            expect(response.body.data.state).toBe('published');
        });

        it('should update state from draft to published', async () => {
            const response = await request(app)
                .patch(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ state: 'published' })
                .expect(200);

            expect(response.body.data.state).toBe('published');
        });

        it('should fail to update without authentication', async () => {
            await request(app)
                .patch(`/api/blogs/${blogId}`)
                .send({ title: 'New Title' })
                .expect(401);
        });

        it('should fail to update another user\'s blog', async () => {
            const response = await request(app)
                .patch(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${anotherAuthToken}`)
                .send({ title: 'Unauthorized Update' })
                .expect(403);

            expect(response.body.status).toBe('fail');
        });

        it('should return 404 for non-existent blog', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await request(app)
                .patch(`/api/blogs/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'New Title' })
                .expect(404);
        });
    });

    describe('DELETE /api/blogs/:id', () => {
        let draftBlogId;
        let publishedBlogId;

        beforeEach(async () => {
            const draftBlog = await Blog.create({
                title: 'Draft to Delete',
                description: 'Test',
                body: 'Content',
                state: 'draft',
                author: userId,
                tags: ['test']
            });
            draftBlogId = draftBlog._id;

            const publishedBlog = await Blog.create({
                title: 'Published to Delete',
                description: 'Test',
                body: 'Content',
                state: 'published',
                author: userId,
                tags: ['test']
            });
            publishedBlogId = publishedBlog._id;
        });

        it('should delete draft blog by owner', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${draftBlogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toBeNull();

            // Verify blog is deleted
            const blog = await Blog.findById(draftBlogId);
            expect(blog).toBeNull();
        });

        it('should delete published blog by owner', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${publishedBlogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.status).toBe('success');

            // Verify blog is deleted
            const blog = await Blog.findById(publishedBlogId);
            expect(blog).toBeNull();
        });

        it('should fail to delete without authentication', async () => {
            await request(app)
                .delete(`/api/blogs/${draftBlogId}`)
                .expect(401);
        });

        it('should fail to delete another user\'s blog', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${draftBlogId}`)
                .set('Authorization', `Bearer ${anotherAuthToken}`)
                .expect(403);

            expect(response.body.status).toBe('fail');
        });

        it('should return 404 for non-existent blog', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await request(app)
                .delete(`/api/blogs/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });
});
