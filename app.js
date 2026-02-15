const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.route');
const blogRoutes = require('./routes/blog.route');
const logger = require('./utils/logger');

// Middleware
app.use(express.json());

// Root route / Health check
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Blog API is running',
        endpoints: {
            auth: '/api/auth',
            blogs: '/api/blogs'
        }
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

const globalErrorHandler = require('./middlewares/error.middleware');

// Error handling
app.use(globalErrorHandler);

module.exports = app;