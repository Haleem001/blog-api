# Blogging API - Semester Examination Project
A RESTful API for a blogging platform built with Node.js, Express, and MongoDB.

## Live API

The API is deployed on Heroku and can be accessed at:
```
https://mg-blog-api-0018a1b3f2e8.herokuapp.com/
```

## Features

### User Management
- User registration with first_name, last_name, email, and password
- Secure authentication using JWT (tokens expire after 1 hour)
- Password hashing with bcrypt

### Blog Management
- Create blogs (automatically set to draft state)
- Update blog state from draft to published
- Edit and delete blogs (both draft and published)
- View own blogs with pagination and state filtering
- Automatic reading time calculation
- Read count tracking

### Public Access
- View all published blogs (paginated, 20 per page by default)
- Search blogs by author name, title, and tags
- Order blogs by read_count, reading_time, or timestamp
- View single published blog with author information

### Blog Schema
Each blog contains:
- title
- description
- tags
- author (populated with user info)
- timestamp
- state (draft/published)
- read_count
- reading_time (auto-calculated)
- body

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blog-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog-api
TEST_DB_URI=mongodb://localhost:27017/blog-api-test
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

5. Make sure MongoDB is running on your machine.

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Running Tests

The project includes comprehensive tests for all endpoints using Jest and Supertest.

### Run all tests:
```bash
npm test
```

### Run tests without watch mode:
```bash
npx jest
```

### Run tests with coverage:
```bash
npx jest --coverage
```

**Note:** Make sure MongoDB is running before executing tests. Tests use a separate test database specified in `TEST_DB_URI`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Blogs (Public)
- `GET /api/blogs` - Get all published blogs
  - Query params: `page`, `limit`, `search`, `orderBy`, `tag`
- `GET /api/blogs/:id` - Get single published blog (increments read_count)

### Blogs (Protected - Requires Authentication)
- `POST /api/blogs` - Create a new blog
- `GET /api/blogs/me` - Get own blogs
  - Query params: `page`, `limit`, `state`
- `PATCH /api/blogs/:id` - Update own blog
- `DELETE /api/blogs/:id` - Delete own blog

### Authentication Header
For protected routes, include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Test Coverage

The test suite includes:

### Auth Tests
- User signup with validation
- User login with credentials
- Token generation and expiration
- Error handling for invalid credentials

### Blog Tests
- Create blog (defaults to draft)
- Get all published blogs with pagination
- Search by author, title, and tags
- Order by read_count, reading_time, timestamp
- Get single blog with author info and read count increment
- Get own blogs with pagination and state filtering
- Update blog (only by owner)
- Delete blog (only by owner)
- Authorization checks for protected routes

## Project Structure

```
blog-api/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── auth.controller.js # Authentication logic
│   └── blog.controller.js # Blog CRUD operations
├── middlewares/
│   ├── auth.middleware.js # JWT verification
│   └── error.middleware.js # Global error handler
├── models/
│   ├── user.model.js      # User schema
│   └── blog.model.js      # Blog schema
├── routes/
│   ├── auth.route.js      # Auth routes
│   └── blog.route.js      # Blog routes
├── tests/
│   ├── auth.test.js       # Auth endpoint tests
│   └── blog.test.js       # Blog endpoint tests
├── utils/
│   ├── blog.utils.js      # Reading time calculation
│   └── logger.js          # Winston logger
├── app.js                 # Express app setup
├── server.js              # Server entry point
└── jest.config.js         # Jest configuration

```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Jest** - Testing framework
- **Supertest** - HTTP assertions
- **Winston** - Logging

## License

ISC